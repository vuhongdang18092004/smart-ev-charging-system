package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.VehicleInfoRequest;
import com.smart.evcharging.backend.dto.response.ApiResponse;
import com.smart.evcharging.backend.dto.response.VehicleInfoResponse;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.service.VehicleInfoService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vehicles-infor")
public class VehicleInfoController extends BaseController {
    private final VehicleInfoService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<VehicleInfoResponse>>> list(Pageable pageable) {
        return ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleInfoResponse>> detail(@PathVariable UUID id) {
        return ok(service.detail(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleInfoResponse>> create(
            @Valid @RequestBody VehicleInfoRequest request) {
        VehicleInfoResponse result = service.create(request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.id()).toUri(), result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleInfoResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody VehicleInfoRequest request) {
        return ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
