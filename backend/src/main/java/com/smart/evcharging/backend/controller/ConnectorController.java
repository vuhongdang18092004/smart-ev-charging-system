package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.ConnectorRequest;
import com.smart.evcharging.backend.dto.response.ApiResponse;
import com.smart.evcharging.backend.dto.response.ConnectorResponse;
import com.smart.evcharging.backend.service.StationService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/connectors")
public class ConnectorController extends BaseController {
    private final StationService service;

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ConnectorResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody ConnectorRequest request) {
        return ok(service.updateConnector(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteConnector(id);
        return ResponseEntity.noContent().build();
    }
}
