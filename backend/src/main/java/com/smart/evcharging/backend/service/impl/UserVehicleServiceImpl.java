package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.dto.response.VehicleOptionResponse;
import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.request.UserVehicleRequest;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.UserVehicleResponse;
import com.smart.evcharging.backend.entity.UserAccount;
import com.smart.evcharging.backend.entity.UserVehicle;
import com.smart.evcharging.backend.entity.VehicleInfo;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import com.smart.evcharging.backend.repository.UserVehicleRepository;
import com.smart.evcharging.backend.repository.VehicleInfoRepository;
import com.smart.evcharging.backend.service.UserVehicleService;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserVehicleServiceImpl implements UserVehicleService {
    private final UserVehicleRepository vehicles;
    private final VehicleInfoRepository catalog;
    private final UserAccountRepository users;

    @Override
    public PaginatedResponse<UserVehicleResponse> list(String email, Pageable pageable) {
        Pageable ordered = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("createdAt", "id"));
        return PaginatedResponse.from(vehicles.findByUserIdAndDeletedAtIsNull(driver(email).getId(), ordered)
                .map(UserVehicleServiceImpl::toResponse));
    }

    @Override
    public UserVehicleResponse detail(String email, UUID id) {
        return vehicles.findByIdAndUserIdAndDeletedAtIsNull(id, driver(email).getId())
                .map(UserVehicleServiceImpl::toResponse).orElseThrow(UserVehicleServiceImpl::notFound);
    }

    @Override
    @Transactional
    public UserVehicleResponse create(String email, UserVehicleRequest request) {
        UserVehicle vehicle = new UserVehicle();
        vehicle.setUser(driver(email));
        vehicle.setVehicleInfo(activeOption(request.vehicleInfoId()));
        applyName(vehicle, request.name());
        return toResponse(vehicles.saveAndFlush(vehicle));
    }

    @Override
    @Transactional
    public UserVehicleResponse update(String email, UUID id, UserVehicleRequest request) {
        UserVehicle vehicle = lockOwned(email, id);
        if (!vehicle.getVehicleInfo().getId().equals(request.vehicleInfoId())) {
            vehicle.setVehicleInfo(activeOption(request.vehicleInfoId()));
        }
        if (request.name() != null) applyName(vehicle, request.name());
        vehicles.flush();
        return toResponse(vehicle);
    }

    @Override
    @Transactional
    public void delete(String email, UUID id) {
        lockOwned(email, id).markDeleted(Instant.now());
    }

    private static void applyName(UserVehicle vehicle, String name) {
        vehicle.setName(name == null || name.isBlank() ? vehicle.getVehicleInfo().getModel() : name.strip());
    }

    private UserVehicle lockOwned(String email, UUID id) {
        return vehicles.findForUpdateByIdAndUserIdAndDeletedAtIsNull(id, driver(email).getId())
                .orElseThrow(UserVehicleServiceImpl::notFound);
    }

    private VehicleInfo activeOption(UUID id) {
        return catalog.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.INVALID_VEHICLE_INFO, HttpStatus.BAD_REQUEST));
    }

    private UserAccount driver(String email) {
        return users.findByLoginEmail(email)
                .filter(user -> DomainValues.DRIVER.equals(user.getRole()) && DomainValues.ACTIVE.equals(user.getStatus()))
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.DRIVER_REQUIRED, HttpStatus.FORBIDDEN));
    }

    private static UserVehicleResponse toResponse(UserVehicle vehicle) {
        var model = vehicle.getVehicleInfo();
        var option = new VehicleOptionResponse(
                model.getId(), model.getBrand().getId(), model.getModel(), model.getBrand().getName());
        return new UserVehicleResponse(vehicle.getId(), vehicle.getUser().getId(), model.getId(),
                vehicle.getCreatedAt(), vehicle.getUpdatedAt(), option, vehicle.getName());
    }

    private static CustomBusinessException notFound() {
        return new CustomBusinessException(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
}
