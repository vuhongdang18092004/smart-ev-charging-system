package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.BrandRequest;
import com.smart.evcharging.backend.dto.response.BrandResponse;
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
@RequestMapping("/api/brands")
public class BrandController extends BaseController {
    private final CatalogService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandResponse>>> list() {
        return ok(service.brands());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody BrandRequest request) {
        return ok(service.updateBrand(id, request));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> create(
            @Valid @RequestBody BrandRequest request) {
        BrandResponse result = service.createBrand(request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.id()).toUri(), result);
    }
}
