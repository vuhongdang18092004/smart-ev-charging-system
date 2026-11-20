package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.StationReportRequest;
import com.smart.evcharging.backend.dto.response.ApiResponse;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.StationReportResponse;
import com.smart.evcharging.backend.service.StationReportService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class StationReportController extends BaseController {
    private final StationReportService service;

    @PostMapping("/stations/{stationId}/reports")
    public ResponseEntity<ApiResponse<StationReportResponse>> create(
            @PathVariable UUID stationId, @Valid @RequestBody StationReportRequest request) {
        StationReportResponse result = service.create(stationId, request);
        return created(ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/station-reports/{id}")
                .buildAndExpand(result.id()).toUri(), result);
    }

    @GetMapping("/stations/{stationId}/reports")
    public ResponseEntity<ApiResponse<PaginatedResponse<StationReportResponse>>> list(
            @PathVariable UUID stationId, @PageableDefault(size = 10) Pageable pageable) {
        return ok(service.list(stationId, pageable));
    }

    @GetMapping("/station-reports/{id}")
    public ResponseEntity<ApiResponse<StationReportResponse>> detail(@PathVariable UUID id) {
        return ok(service.detail(id));
    }
}
