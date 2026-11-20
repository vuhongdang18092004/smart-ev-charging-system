package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.ConnectorTypeRequest;
import com.smart.evcharging.backend.dto.response.ConnectorTypeResponse;
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
@RequestMapping("/api/connector-types")
public class ConnectorTypeController extends BaseController {
    private final CatalogService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConnectorTypeResponse>>> list() {
        return ok(service.connectorTypes());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ConnectorTypeResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody ConnectorTypeRequest request) {
        return ok(service.updateConnectorType(id, request));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConnectorTypeResponse>> create(
            @Valid @RequestBody ConnectorTypeRequest request) {
        ConnectorTypeResponse result = service.createConnectorType(request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.id()).toUri(), result);
    }
}
