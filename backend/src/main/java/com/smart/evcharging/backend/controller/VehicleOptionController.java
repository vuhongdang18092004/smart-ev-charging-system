package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.response.ApiResponse;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.VehicleOptionResponse;
import com.smart.evcharging.backend.service.VehicleInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vehicle-options")
public class VehicleOptionController extends BaseController {
    private final VehicleInfoService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<VehicleOptionResponse>>> list(Pageable pageable) {
        return ok(service.options(pageable));
    }
}
