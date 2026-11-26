package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.UserVoucherStatus;
import com.smart.evcharging.backend.service.VoucherService;
import java.security.Principal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/driver")
public class DriverVoucherController extends BaseController {
    private final VoucherService service;

    @GetMapping("/vouchers/available")
    public ResponseEntity<ApiResponse<PaginatedResponse<AvailableVoucherResponse>>> available(Principal principal,
            @RequestParam(required = false) UUID stationId, @RequestParam(required = false) UUID brandId, Pageable pageable) {
        return ok(service.available(principal.getName(), stationId, brandId, pageable));
    }

    @PostMapping("/vouchers/{voucherId}/claim")
    public ResponseEntity<ApiResponse<UserVoucherResponse>> claim(Principal principal, @PathVariable UUID voucherId) {
        return ok(service.claim(principal.getName(), voucherId));
    }

    @GetMapping("/vouchers/my")
    public ResponseEntity<ApiResponse<PaginatedResponse<UserVoucherResponse>>> wallet(Principal principal,
            @RequestParam(required = false) UserVoucherStatus status, Pageable pageable) {
        return ok(service.wallet(principal.getName(), status, pageable));
    }

    @PostMapping("/user-vouchers/{userVoucherId}/download-qr")
    public ResponseEntity<ApiResponse<UserVoucherResponse>> downloadQr(Principal principal, @PathVariable UUID userVoucherId) {
        UserVoucherResponse voucher = service.downloadQr(principal.getName(), userVoucherId);
        if (voucher.status() == UserVoucherStatus.EXPIRED) {
            throw new CustomBusinessException(ErrorCodes.VOUCHER_EXPIRED, HttpStatus.GONE);
        }
        return ok(voucher);
    }
}
