package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.*;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.service.StationService;
import jakarta.validation.Valid;
import java.util.UUID;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stations")
public class StationController extends BaseController {
    private final StationService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<StationResponse>>> list(
            @Valid @ModelAttribute StationFilter filter, @PageableDefault(size = 10) Pageable pageable) {
        return ok(service.search(filter, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StationDetailResponse>> detail(@PathVariable UUID id) {
        return ok(service.detail(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StationDetailResponse>> create(@Valid @RequestBody CreateStationRequest request) {
        StationDetailResponse result = service.create(request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.station().id()).toUri(), result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StationResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody StationRequest request) {
        return ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<StationImageResponse>> addImage(
            @PathVariable UUID id, @Valid @RequestBody StationImageRequest request) {
        StationImageResponse result = service.addImage(id, request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{imageId}")
                .buildAndExpand(result.id()).toUri(), result);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable UUID id, @PathVariable UUID imageId) {
        service.deleteImage(id, imageId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/connectors")
    public ResponseEntity<ApiResponse<List<ConnectorResponse>>> addConnectors(
            @PathVariable UUID id, @Valid @RequestBody CreateConnectorsRequest request) {
        List<ConnectorResponse> result = service.addConnectors(id, request);
        return created(ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/stations/{id}")
                .buildAndExpand(id).toUri(), result);
    }
}
