package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.VoucherRejectRequest;
import com.smart.evcharging.backend.dto.request.VoucherRequest;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.VoucherStatus;
import com.smart.evcharging.backend.service.VoucherService;
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
@RequestMapping("/api/vouchers")
public class VoucherController extends BaseController {
    private final VoucherService service;

    @PostMapping
    public ResponseEntity<ApiResponse<VoucherResponse>> create(Principal principal,
            @Valid @RequestBody VoucherRequest request) {
        VoucherResponse voucher = service.create(principal.getName(), request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(voucher.offer().id()).toUri(), voucher);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<VoucherResponse>>> list(Principal principal,
            @RequestParam(required = false) VoucherStatus status, @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID stationId, Pageable pageable) {
        return ok(service.list(principal.getName(), status, keyword, stationId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> detail(Principal principal, @PathVariable UUID id) {
        return ok(service.detail(principal.getName(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> update(Principal principal, @PathVariable UUID id,
            @Valid @RequestBody VoucherRequest request) {
        return ok(service.update(principal.getName(), id, request));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<VoucherResponse>> submit(Principal principal, @PathVariable UUID id) {
        return ok(service.submit(principal.getName(), id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<VoucherResponse>> approve(Principal principal, @PathVariable UUID id) {
        return ok(service.approve(principal.getName(), id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<VoucherResponse>> reject(Principal principal, @PathVariable UUID id,
            @Valid @RequestBody VoucherRejectRequest request) {
        return ok(service.reject(principal.getName(), id, request.rejectionReason()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable UUID id) {
        service.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
