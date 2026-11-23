package com.smart.evcharging.backend.config;

import com.smart.evcharging.backend.repository.AuthSessionRepository;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import com.smart.evcharging.backend.service.impl.AuthServiceImpl;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
final class BearerSessionFilter extends OncePerRequestFilter {
    private final AuthTokenCodec codec;
    private final UserAccountRepository users;
    private final AuthSessionRepository sessions;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            try {
                authenticate(header.substring(7));
            } catch (JwtException | IllegalArgumentException invalid) {
                SecurityContextHolder.clearContext();
                response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private void authenticate(String raw) {
        Jwt jwt = codec.decode(raw);
        String client = jwt.getClaimAsString("client");
        String subject = jwt.getSubject();
        String session = jwt.getClaimAsString("sid");
        Instant now = Instant.now();
        if (client == null || subject == null || session == null || jwt.getExpiresAt() == null
                || !jwt.getExpiresAt().isAfter(now)) {
            throw new JwtException("Invalid session");
        }
        UUID id = UUID.fromString(subject);
        UUID family = UUID.fromString(session);
        var user = users.findById(id).filter(account -> account.getDeletedAt() == null && account.isEmailVerified()
                && "active".equals(account.getStatus()) && account.getRole().equals(jwt.getClaimAsString("role"))
                && AuthServiceImpl.clientAllowed(account, client)).orElseThrow(() -> new JwtException("Invalid session"));
        if (!sessions.active(id, family, client, now)) {
            throw new JwtException("Invalid session");
        }
        var authentication = UsernamePasswordAuthenticationToken.authenticated(user.getEmail(), null,
                AuthorityUtils.createAuthorityList("ROLE_" + user.getRole().toUpperCase(Locale.ROOT)));
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
    }
}
