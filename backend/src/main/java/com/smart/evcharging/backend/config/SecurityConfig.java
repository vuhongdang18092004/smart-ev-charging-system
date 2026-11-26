package com.smart.evcharging.backend.config;

import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import com.smart.evcharging.backend.repository.AuthSessionRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration(proxyBeanMethods = false)
public class SecurityConfig {
    private static final String VOUCHERS = "/api/vouchers/**";
    private static final String DRIVER_VOUCHERS = "/api/driver/vouchers/**";
    private static final String USER_VOUCHERS = "/api/driver/user-vouchers/**";
    private static final String VOUCHER_APPROVE = "/api/vouchers/*/approve";
    private static final String VOUCHER_REJECT = "/api/vouchers/*/reject";
    private static final String VOUCHER_SUBMIT = "/api/vouchers/*/submit";
    private static final String BLOG_MANAGEMENT = "/api/blog-posts/**";
    private static final String PUBLIC_BLOG = "/api/public/blog-posts/**";
    private static final String BLOG_APPROVE = "/api/blog-posts/*/approve";
    private static final String BLOG_REJECT = "/api/blog-posts/*/reject";
    private static final String BLOG_SUBMIT = "/api/blog-posts/*/submit";

    @Bean
    @Order(0)
    @ConditionalOnProperty(name="app.auth.enabled", havingValue="true")
    SecurityFilterChain jwtSecurityFilterChain(HttpSecurity http, AuthProperties properties, AuthTokenCodec codec,
            UserAccountRepository users, AuthSessionRepository sessions) throws Exception {
        if (properties.legacyBasicEnabled()) {
            http.httpBasic(Customizer.withDefaults());
        }
        return stateless(http)
                .addFilterBefore(new BearerSessionFilter(codec, users, sessions), UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(errors -> errors.accessDeniedHandler((request, response, exception) -> response.setStatus(403))
                        .authenticationEntryPoint((request, response, exception) -> {
                    response.setHeader("WWW-Authenticate", "Bearer");
                    response.setStatus(401);
                }))
                .authorizeHttpRequests(rules -> rules
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/verify-email",
                                "/api/auth/resend-otp", "/api/auth/login", "/api/auth/refresh", "/api/auth/logout",
                                "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_BLOG).permitAll()
                        .requestMatchers(HttpMethod.POST, BLOG_APPROVE, BLOG_REJECT, VOUCHER_APPROVE, VOUCHER_REJECT).hasRole("ADMIN")
                        .requestMatchers(DRIVER_VOUCHERS, USER_VOUCHERS).hasRole("DRIVER")
                        .requestMatchers(HttpMethod.POST, BLOG_SUBMIT, VOUCHER_SUBMIT).hasRole("OPERATOR")
                        .requestMatchers(VOUCHERS, BLOG_MANAGEMENT).hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers("/api/auth/me").hasAnyRole("ADMIN", "OPERATOR", "DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/operators").denyAll()
                        .requestMatchers("/api/user-vehicles/**", "/api/vehicle-options").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.GET, "/api/stations", "/api/stations/*").hasAnyRole("ADMIN", "USER", "OPERATOR", "DRIVER")
                        .requestMatchers(HttpMethod.GET, "/api/brands", "/api/operators", "/api/connector-types").hasAnyRole("ADMIN", "USER", "OPERATOR")
                        .requestMatchers(HttpMethod.POST, "/api/stations", "/api/stations/*/images", "/api/stations/*/connectors").hasAnyRole("ADMIN", "USER", "OPERATOR")
                        .requestMatchers(HttpMethod.PUT, "/api/stations/*", "/api/connectors/*").hasAnyRole("ADMIN", "USER", "OPERATOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/stations/*", "/api/connectors/*", "/api/stations/*/images/*").hasAnyRole("ADMIN", "USER", "OPERATOR")
                        .requestMatchers("/api/brands/**", "/api/vehicles-infor/**").hasAnyRole("ADMIN", "OPERATOR")
                        .anyRequest().hasAnyRole("ADMIN", "USER"))
                .build();
    }
    @Bean
    @Order(1)
    @ConditionalOnProperty(name="app.auth.enabled", havingValue="false", matchIfMissing=true)
    SecurityFilterChain vehicleSecurityFilterChain(HttpSecurity http, UserDetailsService configuredAdmin,
            UserAccountRepository users) throws Exception {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(new VehicleUserDetailsService(configuredAdmin, users));
        provider.setPasswordEncoder(PasswordEncoderFactories.createDelegatingPasswordEncoder());

        return base(http)
                .securityMatcher(VOUCHERS, DRIVER_VOUCHERS, USER_VOUCHERS, BLOG_MANAGEMENT, "/api/brands/**", "/api/vehicles-infor/**", "/api/user-vehicles/**", "/api/vehicle-options/**")
                .authenticationManager(new ProviderManager(provider))
                .authorizeHttpRequests(rules -> rules
                        .requestMatchers(HttpMethod.POST, BLOG_APPROVE, BLOG_REJECT, VOUCHER_APPROVE, VOUCHER_REJECT).hasRole("ADMIN")
                        .requestMatchers(DRIVER_VOUCHERS, USER_VOUCHERS).hasRole("DRIVER")
                        .requestMatchers(HttpMethod.POST, BLOG_SUBMIT, VOUCHER_SUBMIT).hasRole("OPERATOR")
                        .requestMatchers(VOUCHERS, BLOG_MANAGEMENT, "/api/brands/**", "/api/vehicles-infor/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers("/api/user-vehicles/**").hasRole(DomainValues.DRIVER_AUTHORITY)
                        .requestMatchers(HttpMethod.GET, "/api/vehicle-options").hasRole(DomainValues.DRIVER_AUTHORITY)
                        .anyRequest().denyAll())
                .build();
    }

    @Bean
    @ConditionalOnProperty(name="app.auth.enabled", havingValue="false", matchIfMissing=true)
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return base(http).authorizeHttpRequests(rules -> rules
                .requestMatchers(HttpMethod.GET, PUBLIC_BLOG).permitAll()
                .anyRequest().authenticated()).build();
    }

    private static HttpSecurity base(HttpSecurity http) throws Exception {
        return stateless(http).httpBasic(Customizer.withDefaults());
    }

    private static HttpSecurity stateless(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
                .sessionManagement(sessions -> sessions.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .requestCache(AbstractHttpConfigurer::disable);
    }
}
