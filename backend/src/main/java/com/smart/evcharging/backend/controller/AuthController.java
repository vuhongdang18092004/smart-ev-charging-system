package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.config.AuthProperties;
import com.smart.evcharging.backend.dto.request.AuthRequests.*;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@ConditionalOnProperty(name="app.auth.enabled", havingValue="true")
@RequestMapping("/api")
public class AuthController extends BaseController {
    private record Limit(long minute, int count) {}
    private final Map<String, Limit> requestsByIp = new HashMap<>();
    private final AuthService service;
    private final AuthProperties settings;

    @PostMapping("/auth/register")
    public ResponseEntity<Void> register(@Valid @RequestBody Registration request, HttpServletRequest http) {
        limit(http);
        service.register(request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/auth/verify-email")
    public ResponseEntity<Void> verify(@Valid @RequestBody Verification request, HttpServletRequest http) {
        limit(http);
        service.verify(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/resend-otp")
    public ResponseEntity<Void> resend(@Valid @RequestBody Email request, HttpServletRequest http) {
        limit(http);
        service.resend(request.email());
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/auth/forgot-password")
    public ResponseEntity<Void> forgot(@Valid @RequestBody Email request, HttpServletRequest http) {
        limit(http);
        try {
            service.forgot(request.email());
        } catch (com.smart.evcharging.backend.common.exception.AuthDeliveryException ignored) {
            // Return the same public response whether the account or its delivery exists.
        }
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<Void> reset(@Valid @RequestBody Reset request, HttpServletRequest http) {
        limit(http);
        service.reset(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<AuthSessionResponse>> login(@Valid @RequestBody Login request, HttpServletRequest http) {
        limit(http);
        return session(service.login(request));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<ApiResponse<AuthSessionResponse>> refresh(@Valid @RequestBody Refresh request, HttpServletRequest http) {
        return session(service.refresh(request));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody Refresh request) {
        service.logout(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/auth/me")
    public ResponseEntity<ApiResponse<AuthUserResponse>> me(Principal principal) {
        return ok(service.me(principal.getName()));
    }

    @PostMapping("/admin/operators")
    public ResponseEntity<Void> invite(@Valid @RequestBody Invitation request) {
        service.invite(request);
        return ResponseEntity.accepted().build();
    }

    private static ResponseEntity<ApiResponse<AuthSessionResponse>> session(AuthSessionResponse value) {
        return ResponseEntity.ok().cacheControl(org.springframework.http.CacheControl.noStore())
                .body(ApiResponse.success(value));
    }

    private synchronized void limit(HttpServletRequest request) {
        long minute = Instant.now().getEpochSecond() / 60;
        requestsByIp.values().removeIf(value -> value.minute() < minute);
        String ip = request.getRemoteAddr();
        Limit current = requestsByIp.getOrDefault(ip, new Limit(minute, 0));
        if (current.count() >= settings.ipRequestsPerMinute()
                || (!requestsByIp.containsKey(ip) && requestsByIp.size() >= 10_000)) {
            throw new CustomBusinessException("error.too-many-attempts", HttpStatus.TOO_MANY_REQUESTS);
        }
        requestsByIp.put(ip, new Limit(minute, current.count() + 1));
    }
}
