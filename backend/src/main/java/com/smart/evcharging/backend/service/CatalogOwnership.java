package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CatalogOwnership {
    private final UserAccountRepository users;

    public UUID operatorId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_OPERATOR"))) {
            return null;
        }
        return users.findLoginId(authentication.getName())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.OPERATOR_NOT_FOUND, HttpStatus.FORBIDDEN));
    }

    public void requireOwner(UUID creator) {
        UUID operatorId = operatorId();
        if (operatorId != null && !operatorId.equals(creator)) {
            throw new CustomBusinessException(ErrorCodes.CATALOG_OWNER_REQUIRED, HttpStatus.FORBIDDEN);
        }
    }
}
