package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.AllowedBrandsRequest;
import com.smart.evcharging.backend.dto.request.OperatorRequest;
import com.smart.evcharging.backend.dto.request.UpdateOperatorRequest;
import com.smart.evcharging.backend.dto.response.AllowedBrandResponse;
import com.smart.evcharging.backend.dto.response.OperatorResponse;
import com.smart.evcharging.backend.service.CatalogService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import com.smart.evcharging.backend.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/operators")
public class OperatorController extends BaseController {
    private final CatalogService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OperatorResponse>>> list() {
        return ok(service.operators());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OperatorResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateOperatorRequest request) {
        return ok(service.updateOperator(id, request));
    }

    @GetMapping("/{operatorId}/allowed-brands")
    public ResponseEntity<ApiResponse<List<AllowedBrandResponse>>> allowedBrands(@PathVariable UUID operatorId) {
        return ok(service.allowedBrands(operatorId));
    }

    @PutMapping("/{operatorId}/allowed-brands")
    public ResponseEntity<ApiResponse<List<AllowedBrandResponse>>> replaceAllowedBrands(
            @PathVariable UUID operatorId, @Valid @RequestBody AllowedBrandsRequest request) {
        return ok(service.replaceAllowedBrands(operatorId, request.brandIds()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OperatorResponse>> create(
            @Valid @RequestBody OperatorRequest request) {
        OperatorResponse result = service.createOperator(request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.id()).toUri(), result);
    }
}
