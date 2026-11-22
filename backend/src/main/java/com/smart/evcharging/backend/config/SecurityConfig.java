package com.smart.evcharging.backend.config;

import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.repository.UserAccountRepository;
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

@Configuration(proxyBeanMethods = false)
public class SecurityConfig {
    @Bean
    @Order(1)
    SecurityFilterChain vehicleSecurityFilterChain(HttpSecurity http, UserDetailsService configuredAdmin,
            UserAccountRepository users) throws Exception {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(new VehicleUserDetailsService(configuredAdmin, users));
        provider.setPasswordEncoder(PasswordEncoderFactories.createDelegatingPasswordEncoder());

        return base(http)
                .securityMatcher("/api/vehicles-infor/**", "/api/user-vehicles/**", "/api/vehicle-options/**")
                .authenticationManager(new ProviderManager(provider))
                .authorizeHttpRequests(rules -> rules
                        .requestMatchers("/api/vehicles-infor/**").hasRole(DomainValues.ADMIN_AUTHORITY)
                        .requestMatchers("/api/user-vehicles/**").hasRole(DomainValues.DRIVER_AUTHORITY)
                        .requestMatchers(HttpMethod.GET, "/api/vehicle-options").hasRole(DomainValues.DRIVER_AUTHORITY)
                        .anyRequest().denyAll())
                .build();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return base(http).authorizeHttpRequests(rules -> rules.anyRequest().authenticated()).build();
    }

    private static HttpSecurity base(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
                .sessionManagement(sessions -> sessions.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .requestCache(AbstractHttpConfigurer::disable)
                .httpBasic(Customizer.withDefaults());
    }
}
