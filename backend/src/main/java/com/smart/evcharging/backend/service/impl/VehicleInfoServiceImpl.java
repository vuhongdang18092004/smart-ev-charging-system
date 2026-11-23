package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.repository.UserVehicleRepository;
import com.smart.evcharging.backend.service.CatalogOwnership;
import com.smart.evcharging.backend.common.base.BaseServiceImpl;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.request.VehicleInfoRequest;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.VehicleInfo;
import com.smart.evcharging.backend.repository.BrandRepository;
import com.smart.evcharging.backend.repository.VehicleInfoRepository;
import com.smart.evcharging.backend.service.VehicleInfoService;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class VehicleInfoServiceImpl extends BaseServiceImpl<VehicleInfo, UUID> implements VehicleInfoService {
    private final VehicleInfoRepository vehicles;
    private final BrandRepository brands;
    private final CatalogOwnership ownership;
    private final UserVehicleRepository userVehicles;

    public VehicleInfoServiceImpl(VehicleInfoRepository vehicles, BrandRepository brands,
            CatalogOwnership ownership,
            UserVehicleRepository userVehicles) {
        super(vehicles);
        this.vehicles = vehicles;
        this.brands = brands;
        this.ownership = ownership;
        this.userVehicles = userVehicles;
    }

    @Override
    public PaginatedResponse<VehicleInfoResponse> list(Pageable pageable, String keyword, UUID brandId) {
        var page = vehicles.findAll((root, query, cb) -> {
            var filters = cb.isNull(root.get("deletedAt"));
            if (brandId != null) filters = cb.and(filters, cb.equal(root.get("brand").get("id"), brandId));
            if (keyword != null && !keyword.isBlank()) {
                filters = cb.and(filters, cb.gt(cb.locate(cb.lower(root.get("model")),
                        keyword.strip().toLowerCase(java.util.Locale.ROOT)), 0));
            }
            return filters;
        }, ordered(pageable));
        return PaginatedResponse.from(page.map(VehicleInfoServiceImpl::toResponse));
    }

    @Override
    public PaginatedResponse<VehicleOptionResponse> options(Pageable pageable) {
        return PaginatedResponse.from(findAll(ordered(pageable))
                .map(vehicle -> new VehicleOptionResponse(vehicle.getId(), vehicle.getBrand().getId(), vehicle.getModel(), vehicle.getBrand().getName())));
    }

    @Override
    public VehicleInfoResponse detail(UUID id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional
    public VehicleInfoResponse create(VehicleInfoRequest request) {
        VehicleInfo vehicle = new VehicleInfo();
        vehicle.setCreatedByUserId(ownership.operatorId());
        apply(vehicle, request);
        return toResponse(vehicles.saveAndFlush(vehicle));
    }

    @Override
    @Transactional
    public VehicleInfoResponse update(UUID id, VehicleInfoRequest request) {
        VehicleInfo vehicle = lockVehicle(id);
        ownership.requireOwner(vehicle.getCreatedByUserId());
        apply(vehicle, request);
        vehicles.flush();
        return toResponse(vehicle);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        VehicleInfo vehicle = lockVehicle(id);
        ownership.requireOwner(vehicle.getCreatedByUserId());
        if (userVehicles.existsByVehicleInfoIdAndDeletedAtIsNull(id)) {
            throw new CustomBusinessException(ErrorCodes.CONFLICT, HttpStatus.CONFLICT);
        }
        vehicle.markDeleted(Instant.now());
    }

    private VehicleInfo lockVehicle(UUID id) {
        return vehicles.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND));
    }

    private void apply(VehicleInfo vehicle, VehicleInfoRequest request) {
        vehicle.setBrand(brands.findById(request.brandId())
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.INVALID_BRAND, HttpStatus.BAD_REQUEST)));
        vehicle.setModel(request.model().strip());
        vehicle.setBatteryKwh(request.batteryKwh());
        vehicle.setRangeNedcKm(request.rangeNedcKm());
    }

    private static Pageable ordered(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("model", "id"));
    }

    private static VehicleInfoResponse toResponse(VehicleInfo vehicle) {
        return new VehicleInfoResponse(vehicle.getId(), vehicle.getBrand().getId(), vehicle.getModel(),
                vehicle.getBatteryKwh(), vehicle.getRangeNedcKm(), vehicle.getCreatedAt(), vehicle.getUpdatedAt(), vehicle.getCreatedByUserId());
    }
}
