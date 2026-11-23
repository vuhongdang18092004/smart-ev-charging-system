package com.smart.evcharging.backend.config;

import com.smart.evcharging.backend.entity.UserAccount;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import com.smart.evcharging.backend.repository.AuthSessionRepository;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name="app.auth.enabled", havingValue="true")
public class AuthAdminBootstrap implements ApplicationRunner {
    private final AuthProperties settings;
    private final UserAccountRepository users;
    private final AuthSessionRepository sessions;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (settings.adminEmail().isBlank()) return;
        sessions.lockEmail("chargeops:admin-bootstrap");
        if (users.existsByRole("admin")) return;
        String email = settings.adminEmail().strip().toLowerCase(Locale.ROOT);
        if (!email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+") || email.length() > 255
                || settings.adminPassword().isBlank() || settings.adminPassword().length() < 12
                || settings.adminPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("Invalid admin bootstrap configuration");
        }
        UserAccount admin = new UserAccount();
        admin.setEmail(email);
        admin.setName("ChargeOps Admin");
        admin.setRole("admin");
        admin.setStatus("pending");
        admin.setPasswordHash(new BCryptPasswordEncoder().encode(settings.adminPassword()));
        users.saveAndFlush(admin);
    }
}
