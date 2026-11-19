package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.request.*;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.*;
import com.smart.evcharging.backend.repository.*;
import com.smart.evcharging.backend.service.CatalogService;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogServiceImpl implements CatalogService {
    private final BrandRepository brands;
    private final ConnectorTypeRepository connectorTypes;
    private final UserAccountRepository users;
    private final OperatorProfileRepository profiles;
    private final PasswordEncoder passwords = new BCryptPasswordEncoder();

    @Override
    public List<BrandResponse> brands() {
        return brands.findAllByOrderByNameAsc().stream().map(CatalogServiceImpl::toBrand).toList();
    }

    @Override
    public List<ConnectorTypeResponse> connectorTypes() {
        return connectorTypes.findAllByOrderBySortOrderAscNameAsc().stream()
                .map(CatalogServiceImpl::toConnectorType).toList();
    }

    @Override
    public List<OperatorResponse> operators() {
        return profiles.findByUserRoleAndUserDeletedAtIsNullOrderByUserNameAsc(DomainValues.OPERATOR)
                .stream().map(CatalogServiceImpl::toOperator).toList();
    }

    @Override
    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        Brand brand = new Brand();
        brand.setName(request.name().strip());
        brand.setLogoUrl(request.logoUrl());
        brand.setWebsite(request.website());
        brand.setType(Objects.requireNonNullElse(request.type(), DomainValues.DEFAULT_BRAND_TYPE));
        return toBrand(brands.save(brand));
    }

    @Override
    @Transactional
    public ConnectorTypeResponse createConnectorType(ConnectorTypeRequest request) {
        ConnectorType type = new ConnectorType();
        type.setCode(request.code().strip());
        type.setName(request.name().strip());
        type.setCurrentType(request.currentType());
        type.setActive(Objects.requireNonNullElse(request.active(), true));
        type.setSortOrder(Objects.requireNonNullElse(request.sortOrder(), 0));
        return toConnectorType(connectorTypes.save(type));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OperatorResponse createOperator(OperatorRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > DomainValues.BCRYPT_MAX_BYTES) {
            throw new CustomBusinessException(ErrorCodes.INVALID_PASSWORD_LENGTH, HttpStatus.BAD_REQUEST);
        }

        UserAccount user = new UserAccount();
        user.setName(request.name().strip());
        user.setEmail(request.email());
        user.setPasswordHash(passwords.encode(request.password()));
        user.setRole(DomainValues.OPERATOR);
        user.setStatus(DomainValues.ACTIVE);
        users.save(user);

        OperatorProfile profile = new OperatorProfile();
        profile.setUser(user);
        profile.setAccessType(Objects.requireNonNullElse(request.accessType(), DomainValues.DEFAULT_OPERATOR_ACCESS));
        profile.setApiEndpoint(request.apiEndpoint());
        return toOperator(profiles.save(profile));
    }

    private static BrandResponse toBrand(Brand brand) {
        return new BrandResponse(brand.getId(), brand.getName(), brand.getType());
    }

    private static ConnectorTypeResponse toConnectorType(ConnectorType type) {
        return new ConnectorTypeResponse(type.getId(), type.getCode(), type.getName(), type.getCurrentType());
    }

    private static OperatorResponse toOperator(OperatorProfile profile) {
        UserAccount user = profile.getUser();
        return new OperatorResponse(user.getId(), user.getName(), user.getEmail(), profile.getAccessType());
    }
}
