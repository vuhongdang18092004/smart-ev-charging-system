package com.smart.evcharging.backend.config;

import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.entity.UserAccount;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import java.util.Locale;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

final class VehicleUserDetailsService implements UserDetailsService {
    private final UserDetailsService configuredAdmin;
    private final UserAccountRepository users;

    VehicleUserDetailsService(UserDetailsService configuredAdmin, UserAccountRepository users) {
        this.configuredAdmin = configuredAdmin;
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        try {
            return User.withUserDetails(configuredAdmin.loadUserByUsername(username))
                    .roles(DomainValues.ADMIN_AUTHORITY).build();
        } catch (UsernameNotFoundException absentFromConfiguredAccounts) {
            return users.findByLoginEmail(username)
                    .map(VehicleUserDetailsService::databaseAccount)
                    .orElseThrow(() -> new UsernameNotFoundException(ErrorCodes.NOT_FOUND));
        }
    }

    private static UserDetails databaseAccount(UserAccount user) {
        String password = user.getPasswordHash();
        if (password.startsWith("$2")) {
            password = "{bcrypt}" + password;
        }
        if (!password.startsWith("{bcrypt}")) {
            throw new UsernameNotFoundException(ErrorCodes.NOT_FOUND);
        }
        return User.withUsername(user.getEmail()).password(password)
                .roles(user.getRole().toUpperCase(Locale.ROOT))
                .disabled(!DomainValues.ACTIVE.equals(user.getStatus()))
                .build();
    }
}
