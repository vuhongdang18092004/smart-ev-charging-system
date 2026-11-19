package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.OperatorRequest;
import com.smart.evcharging.backend.dto.response.OperatorResponse;
import com.smart.evcharging.backend.service.CatalogService;
import jakarta.validation.Valid;
import java.util.List;
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

    @PostMapping
    public ResponseEntity<ApiResponse<OperatorResponse>> create(
            @Valid @RequestBody OperatorRequest request) {
        OperatorResponse result = service.createOperator(request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.id()).toUri(), result);
    }
}
