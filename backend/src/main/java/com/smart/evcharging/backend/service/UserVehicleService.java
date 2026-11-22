package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.UserVehicleRequest;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.UserVehicleResponse;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface UserVehicleService {
    UserVehicleResponse create(String email, UserVehicleRequest request);
    UserVehicleResponse detail(String email, UUID id);
    PaginatedResponse<UserVehicleResponse> list(String email, Pageable pageable);
    UserVehicleResponse update(String email, UUID id, UserVehicleRequest request);
    void delete(String email, UUID id);
}
