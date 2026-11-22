package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.UserVehicleRequest;
import com.smart.evcharging.backend.dto.response.ApiResponse;
import com.smart.evcharging.backend.dto.response.UserVehicleResponse;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.service.UserVehicleService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-vehicles")
public class UserVehicleController extends BaseController {
    private final UserVehicleService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<UserVehicleResponse>>> list(Principal principal, Pageable pageable) {
        return ok(service.list(principal.getName(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserVehicleResponse>> detail(Principal principal, @PathVariable UUID id) {
        return ok(service.detail(principal.getName(), id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserVehicleResponse>> create(
            Principal principal, @Valid @RequestBody UserVehicleRequest request) {
        UserVehicleResponse result = service.create(principal.getName(), request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.id()).toUri(), result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserVehicleResponse>> update(
            Principal principal, @PathVariable UUID id, @Valid @RequestBody UserVehicleRequest request) {
        return ok(service.update(principal.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable UUID id) {
        service.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
