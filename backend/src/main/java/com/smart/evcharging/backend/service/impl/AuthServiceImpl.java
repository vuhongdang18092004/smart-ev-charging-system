package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.config.AuthProperties;
import com.smart.evcharging.backend.config.AuthTokenCodec;
import com.smart.evcharging.backend.dto.request.AuthRequests.*;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.UserAccount;
import com.smart.evcharging.backend.entity.OperatorProfile;
import com.smart.evcharging.backend.repository.OperatorProfileRepository;
import com.smart.evcharging.backend.repository.AuthSessionRepository;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import com.smart.evcharging.backend.service.AuthService;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.util.*;
import javax.crypto.Mac;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@ConditionalOnProperty(name="app.auth.enabled", havingValue="true")
@Transactional(noRollbackFor = CustomBusinessException.class)
public class AuthServiceImpl implements AuthService {
    private static final String VERIFY = "verify_email";
    private static final String RESET = "reset_password";
    private final UserAccountRepository users;
    private final AuthSessionRepository sessions;
    private final OperatorProfileRepository profiles;
    private final AuthProperties settings;
    private final AuthTokenCodec codec;
    private final JavaMailSender mail;
    private final MessageSource messages;
    private final String from;
    private final SecureRandom random = new SecureRandom();
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();
    private final String dummyHash = passwords.encode(UUID.randomUUID().toString());

    public AuthServiceImpl(UserAccountRepository users, AuthSessionRepository sessions, AuthProperties settings,
            AuthTokenCodec codec, JavaMailSender mail, MessageSource messages, Environment environment,
            OperatorProfileRepository profiles) {
        this.users = users;
        this.sessions = sessions;
        this.profiles = profiles;
        this.settings = settings;
        this.codec = codec;
        this.mail = mail;
        this.messages = messages;
        this.from = environment.getProperty("spring.mail.username", "");
    }

    @Override
    @Transactional
    public void register(Registration request) {
        String email = normalized(request.email());
        sessions.lockEmail(email);
        if (users.existsByLoginEmail(email)) {
            return;
        }
        UserAccount user = newAccount(request.name(), email, "driver", hashPassword(request.password()));
        sendOtp(user, VERIFY);
    }

    @Override
    @Transactional
    public void invite(Invitation request) {
        String email = normalized(request.email());
        sessions.lockEmail(email);
        if (users.existsByLoginEmail(email)) {
            throw error("conflict", HttpStatus.CONFLICT);
        }
        UserAccount user = newAccount(request.name(), email, "operator", passwords.encode(randomToken()));
        OperatorProfile profile = new OperatorProfile();
        profile.setUser(user);
        profile.setAccessType("unknown");
        profiles.save(profile);
        sendOtp(user, RESET);
    }

    private UserAccount newAccount(String name, String email, String role, String passwordHash) {
        UserAccount user = new UserAccount();
        user.setName(name.strip());
        user.setEmail(email);
        user.setRole(role);
        user.setStatus("pending");
        user.setPasswordHash(passwordHash);
        return users.saveAndFlush(user);
    }

    @Override
    public void verify(Verification request) {
        UserAccount user = lockedByEmail(request.email()).orElseThrow(AuthServiceImpl::invalidOtp);
        if ("banned".equals(user.getStatus()) || user.isEmailVerified()) {
            throw invalidOtp();
        }
        consume(user, VERIFY, request.otp());
        markVerified(user);
    }

    @Override
    public void resend(String email) {
        lockedByEmail(email).filter(user -> !user.isEmailVerified() && !"banned".equals(user.getStatus()))
                .filter(user -> !"operator".equals(user.getRole()) || !"pending".equals(user.getStatus()))
                .ifPresent(user -> sendOtp(user, VERIFY));
    }

    @Override
    public void forgot(String email) {
        lockedByEmail(email).filter(user -> !"banned".equals(user.getStatus())).ifPresent(user -> sendOtp(user, RESET));
    }

    @Override
    public void reset(Reset request) {
        String passwordHash = hashPassword(request.password());
        UserAccount user = lockedByEmail(request.email()).orElseThrow(AuthServiceImpl::invalidOtp);
        if ("banned".equals(user.getStatus())) {
            throw invalidOtp();
        }
        consume(user, RESET, request.otp());
        user.setPasswordHash(passwordHash);
        if (!user.isEmailVerified()) {
            markVerified(user);
        }
        sessions.revokeUser(user.getId(), Instant.now());
    }

    @Override
    public AuthSessionResponse login(Login request) {
        Optional<UserAccount> account = lockedByEmail(request.email());
        String hash = account.map(UserAccount::getPasswordHash).orElse(dummyHash);
        if (hash.startsWith("{bcrypt}")) {
            hash = hash.substring("{bcrypt}".length());
        }
        boolean matches = request.password().getBytes(StandardCharsets.UTF_8).length <= 72
                && passwords.matches(request.password(), hash);
        if (!matches || account.isEmpty()) {
            throw error("invalid-credentials", HttpStatus.UNAUTHORIZED);
        }
        UserAccount user = account.get();
        if (!clientAllowed(user, request.client()) || "banned".equals(user.getStatus())) {
            throw error("account-disabled", HttpStatus.FORBIDDEN);
        }
        if (!user.isEmailVerified()) {
            throw error("email-verification-required", HttpStatus.FORBIDDEN);
        }
        if (!"active".equals(user.getStatus())) {
            throw error("account-disabled", HttpStatus.FORBIDDEN);
        }
        return issue(user, UUID.randomUUID(), request.client(), Instant.now());
    }

    @Override
    public AuthSessionResponse refresh(Refresh request) {
        String hash = digest(request.refreshToken());
        AuthSessionRepository.Refresh initial = sessions.refresh(hash).orElseThrow(AuthServiceImpl::invalidSession);
        UserAccount user = users.lockActiveRecord(initial.userId()).orElseThrow(AuthServiceImpl::invalidSession);
        AuthSessionRepository.Refresh token = sessions.refresh(hash).orElseThrow(AuthServiceImpl::invalidSession);
        Instant now = Instant.now();
        if (!token.client().equals(request.client())) {
            throw invalidSession();
        }
        if (token.rotated()) {
            sessions.revokeFamily(token.familyId(), now);
            throw invalidSession();
        }
        if (token.revokedAt() != null || !token.expiresAt().toInstant().isAfter(now)
                || !user.isEmailVerified() || !"active".equals(user.getStatus())
                || !user.getRole().equals(token.role()) || !clientAllowed(user, token.client())) {
            sessions.revokeFamily(token.familyId(), now);
            throw invalidSession();
        }
        sessions.rotate(token.id(), now);
        return issue(user, token.familyId(), token.client(), now);
    }

    @Override
    public void logout(Refresh request) {
        sessions.refresh(digest(request.refreshToken())).filter(token -> token.client().equals(request.client()))
                .ifPresent(token -> users.lockActiveRecord(token.userId())
                        .ifPresent(user -> sessions.revokeFamily(token.familyId(), Instant.now())));
    }

    @Override
    @Transactional(readOnly=true)
    public AuthUserResponse me(String email) {
        return users.findByLoginEmail(email).map(AuthServiceImpl::response).orElseThrow(AuthServiceImpl::invalidSession);
    }

    private AuthSessionResponse issue(UserAccount user, UUID family, String client, Instant now) {
        String refresh = randomToken();
        sessions.addRefresh(UUID.randomUUID(), user.getId(), family, digest(refresh), client, user.getRole(),
                now.plus(settings.refreshTtl()));
        return new AuthSessionResponse(codec.issue(user, family, client, now), refresh,
                settings.accessTtl().toSeconds(), response(user));
    }

    private void sendOtp(UserAccount user, String purpose) {
        Instant now = Instant.now();
        if (sessions.otp(user.getId(), purpose).filter(previous -> previous.createdAt().toInstant()
                .plus(settings.resendDelay()).isAfter(now)).isPresent()) {
            return;
        }
        String otp = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
        sessions.putOtp(user.getId(), purpose, otpHash(user, purpose, otp), now.plus(settings.otpTtl()), now);
        SimpleMailMessage email = new SimpleMailMessage();
        if (!from.isBlank()) email.setFrom(from);
        email.setTo(user.getEmail());
        email.setSubject(messages.getMessage("mail.auth." + purpose + ".subject", null, Locale.ENGLISH));
        email.setText(messages.getMessage("mail.auth.otp.body", new Object[]{otp, settings.otpTtl().toSeconds()}, Locale.ENGLISH));
        try {
            mail.send(email);
        } catch (org.springframework.mail.MailException exception) {
            // Transport exceptions may contain the recipient and message content.
            throw new com.smart.evcharging.backend.common.exception.AuthDeliveryException();
        }
    }

    private void consume(UserAccount user, String purpose, String code) {
        AuthSessionRepository.Otp otp = sessions.otp(user.getId(), purpose).orElseThrow(AuthServiceImpl::invalidOtp);
        Instant now = Instant.now();
        if (otp.consumedAt() != null || !otp.expiresAt().toInstant().isAfter(now)) {
            throw invalidOtp();
        }
        if (otp.attemptCount() >= settings.otpAttempts()) {
            throw error("too-many-attempts", HttpStatus.TOO_MANY_REQUESTS);
        }
        if (!MessageDigest.isEqual(otp.otpHash().getBytes(StandardCharsets.US_ASCII),
                otpHash(user, purpose, code).getBytes(StandardCharsets.US_ASCII))) {
            sessions.failOtp(user.getId(), purpose);
            throw invalidOtp();
        }
        sessions.consumeOtp(user.getId(), purpose, now);
    }

    private String otpHash(UserAccount user, String purpose, String code) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(AuthTokenCodec.key(settings.otpKey()));
            return HexFormat.of().formatHex(mac.doFinal((user.getId() + ":" + purpose + ":" + code).getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String digest(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.US_ASCII)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private Optional<UserAccount> lockedByEmail(String email) {
        return users.findLoginId(normalized(email)).flatMap(users::lockActiveRecord);
    }

    private String hashPassword(String value) {
        if (value.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw error("invalid-password-length", HttpStatus.BAD_REQUEST);
        }
        return passwords.encode(value);
    }

    private static void markVerified(UserAccount user) {
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(Instant.now());
        if ("pending".equals(user.getStatus())) user.setStatus("active");
    }

    public static boolean clientAllowed(UserAccount user, String client) {
        return "driver".equals(user.getRole()) ? "mobile".equals(client)
                : ("admin".equals(user.getRole()) || "operator".equals(user.getRole())) && "web".equals(client);
    }

    private static AuthUserResponse response(UserAccount user) {
        return new AuthUserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isEmailVerified());
    }

    private static String normalized(String email) { return email.strip().toLowerCase(Locale.ROOT); }
    private static CustomBusinessException invalidOtp() { return error("invalid-otp", HttpStatus.BAD_REQUEST); }
    private static CustomBusinessException invalidSession() { return error("invalid-session", HttpStatus.UNAUTHORIZED); }
    private static CustomBusinessException error(String code, HttpStatus status) {
        return new CustomBusinessException("error." + code, status);
    }
}
