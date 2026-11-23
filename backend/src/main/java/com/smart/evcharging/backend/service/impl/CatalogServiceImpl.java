package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.service.CatalogOwnership;
import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.request.*;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.*;
import com.smart.evcharging.backend.repository.*;
import com.smart.evcharging.backend.service.CatalogService;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;
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
    private static final Comparator<Brand> BRAND_ORDER = Comparator.comparing(Brand::getName)
            .thenComparing(Brand::getId);
    private final BrandRepository brands;
    private final CatalogOwnership ownership;
    private final ConnectorTypeRepository connectorTypes;
    private final UserAccountRepository users;
    private final OperatorProfileRepository profiles;
    private final AuthSessionRepository sessions;
    @org.springframework.beans.factory.annotation.Value("${app.auth.enabled:false}")
    private boolean authEnabled;
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
        brand.setCreatedByUserId(ownership.operatorId());
        brand.setType(DomainValues.DEFAULT_BRAND_TYPE);
        applyBrand(brand, request);
        return toBrand(brands.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(UUID id, BrandRequest request) {
        Brand brand = brands.findById(id).orElseThrow(CatalogServiceImpl::notFound);
        ownership.requireOwner(brand.getCreatedByUserId());
        if (brands.existsByNameAndIdNot(request.name().strip(), id)) {
            throw new CustomBusinessException(ErrorCodes.DUPLICATE_BRAND_NAME, HttpStatus.CONFLICT);
        }
        applyBrand(brand, request);
        return toBrand(brand);
    }

    @Override
    @Transactional
    public void deleteBrand(UUID id) {
        Brand brand = brands.findById(id).orElseThrow(CatalogServiceImpl::notFound);
        ownership.requireOwner(brand.getCreatedByUserId());
        brands.delete(brand);
        brands.flush();
    }

    private static void applyBrand(Brand brand, BrandRequest request) {
        brand.setName(request.name().strip());
        brand.setLogoUrl(request.logoUrl());
        brand.setWebsite(request.website());
        if (request.type() != null) {
            brand.setType(request.type());
        }
    }

    @Override
    @Transactional
    public ConnectorTypeResponse createConnectorType(ConnectorTypeRequest request) {
        ConnectorType type = new ConnectorType();
        type.setActive(true);
        type.setSortOrder(0);
        applyConnectorType(type, request);
        return toConnectorType(connectorTypes.save(type));
    }

    @Override
    @Transactional
    public ConnectorTypeResponse updateConnectorType(UUID id, ConnectorTypeRequest request) {
        ConnectorType type = connectorTypes.findById(id).orElseThrow(CatalogServiceImpl::notFound);
        if (connectorTypes.existsByCodeAndIdNot(request.code().strip(), id)) {
            throw new CustomBusinessException(ErrorCodes.DUPLICATE_CONNECTOR_CODE, HttpStatus.CONFLICT);
        }
        applyConnectorType(type, request);
        return toConnectorType(type);
    }

    private static void applyConnectorType(ConnectorType type, ConnectorTypeRequest request) {
        type.setCode(request.code().strip());
        type.setName(request.name().strip());
        type.setCurrentType(request.currentType());
        if (request.active() != null) {
            type.setActive(request.active());
        }
        if (request.sortOrder() != null) {
            type.setSortOrder(request.sortOrder());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OperatorResponse createOperator(OperatorRequest request) {
        UserAccount user = new UserAccount();
        user.setName(request.name().strip());
        user.setEmail(request.email());
        user.setPasswordHash(hashPassword(request.password()));
        user.setRole(DomainValues.OPERATOR);
        user.setStatus(DomainValues.ACTIVE);
        users.save(user);

        OperatorProfile profile = new OperatorProfile();
        profile.setUser(user);
        profile.setAccessType(Objects.requireNonNullElse(request.accessType(), DomainValues.DEFAULT_OPERATOR_ACCESS));
        profile.setApiEndpoint(request.apiEndpoint());
        return toOperator(profiles.save(profile));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OperatorResponse updateOperator(UUID id, UpdateOperatorRequest request) {
        UserAccount user = lockOperator(id);
        OperatorProfile profile = profiles.findById(id).orElseThrow(CatalogServiceImpl::operatorNotFound);
        if (users.existsByEmailForOtherUser(request.email(), id)) {
            throw new CustomBusinessException(ErrorCodes.DUPLICATE_USER_EMAIL, HttpStatus.CONFLICT);
        }
        boolean emailChanged = !user.getEmail().equalsIgnoreCase(request.email());
        boolean statusChanged = request.status() != null && !Objects.equals(request.status(), user.getStatus());
        if (emailChanged) {
            user.setEmailVerified(false);
            user.setEmailVerifiedAt(null);
            if (authEnabled) {
                Instant now = Instant.now();
                sessions.consumeOtp(id, "verify_email", now);
                sessions.consumeOtp(id, "reset_password", now);
            }
        }
        if (authEnabled && (emailChanged || statusChanged || request.password() != null)) {
            sessions.revokeUser(id, Instant.now());
        }
        user.setName(request.name().strip());
        user.setEmail(request.email());
        if (request.status() != null) {
            user.setStatus(request.status());
        }
        if (request.password() != null) {
            user.setPasswordHash(hashPassword(request.password()));
        }
        if (request.accessType() != null) {
            profile.setAccessType(request.accessType());
        }
        profile.setApiEndpoint(request.apiEndpoint());
        return toOperator(profile);
    }

    @Override
    public List<AllowedBrandResponse> allowedBrands(UUID operatorId) {
        UserAccount operator = users.findByIdAndRoleAndDeletedAtIsNull(operatorId, DomainValues.OPERATOR)
                .orElseThrow(CatalogServiceImpl::operatorNotFound);
        return toAllowedBrands(operator);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<AllowedBrandResponse> replaceAllowedBrands(UUID operatorId, List<UUID> brandIds) {
        UserAccount operator = lockOperator(operatorId);
        Set<UUID> requestedIds = new HashSet<>(brandIds);
        List<Brand> requested = brands.findAllById(requestedIds);
        if (requested.size() != requestedIds.size()) {
            throw new CustomBusinessException(ErrorCodes.INVALID_BRAND, HttpStatus.BAD_REQUEST);
        }
        Set<Brand> current = operator.getAllowedBrands();
        current.removeIf(brand -> !requestedIds.contains(brand.getId()));
        Set<UUID> retainedIds = new HashSet<>();
        current.forEach(brand -> retainedIds.add(brand.getId()));
        requested.stream().filter(brand -> !retainedIds.contains(brand.getId())).forEach(current::add);
        return toAllowedBrands(operator);
    }

    private UserAccount lockOperator(UUID id) {
        return users.lockByIdAndRole(id, DomainValues.OPERATOR)
                .orElseThrow(CatalogServiceImpl::operatorNotFound);
    }

    private String hashPassword(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > DomainValues.BCRYPT_MAX_BYTES) {
            throw new CustomBusinessException(ErrorCodes.INVALID_PASSWORD_LENGTH, HttpStatus.BAD_REQUEST);
        }
        return passwords.encode(password);
    }

    private static CustomBusinessException operatorNotFound() {
        return new CustomBusinessException(ErrorCodes.OPERATOR_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    private static CustomBusinessException notFound() {
        return new CustomBusinessException(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    private static Stream<Brand> sortedAllowedBrands(UserAccount operator) {
        return operator.getAllowedBrands().stream().sorted(BRAND_ORDER);
    }

    private static List<AllowedBrandResponse> toAllowedBrands(UserAccount operator) {
        return sortedAllowedBrands(operator)
                .map(brand -> new AllowedBrandResponse(brand.getId(), brand.getName(), brand.getType(), brand.getLogoUrl()))
                .toList();
    }

    private static BrandResponse toBrand(Brand brand) {
        return new BrandResponse(brand.getId(), brand.getName(), brand.getType(), brand.getLogoUrl(), brand.getWebsite(), brand.getCreatedByUserId());
    }

    private static ConnectorTypeResponse toConnectorType(ConnectorType type) {
        return new ConnectorTypeResponse(type.getId(), type.getCode(), type.getName(), type.getCurrentType(),
                type.getActive(), type.getSortOrder());
    }

    private static OperatorResponse toOperator(OperatorProfile profile) {
        UserAccount user = profile.getUser();
        return new OperatorResponse(user.getId(), user.getName(), user.getEmail(), profile.getAccessType(),
                user.getStatus(), profile.getApiEndpoint(), sortedAllowedBrands(user)
                        .map(brand -> new BrandSummaryResponse(brand.getId(), brand.getName(), brand.getType()))
                        .toList());
    }
}
