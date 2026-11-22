package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.VehicleInfoRequest;
import com.smart.evcharging.backend.dto.response.*;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface VehicleInfoService {
    VehicleInfoResponse create(VehicleInfoRequest request);
    VehicleInfoResponse detail(UUID id);
    PaginatedResponse<VehicleInfoResponse> list(Pageable pageable);
    VehicleInfoResponse update(UUID id, VehicleInfoRequest request);
    void delete(UUID id);
    PaginatedResponse<VehicleOptionResponse> options(Pageable pageable);
}
