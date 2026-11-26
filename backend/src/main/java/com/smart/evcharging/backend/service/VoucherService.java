package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.VoucherRequest;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.UserVoucherStatus;
import com.smart.evcharging.backend.entity.VoucherStatus;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface VoucherService {
    PaginatedResponse<VoucherResponse> list(String email, VoucherStatus status, String keyword, UUID stationId, Pageable pageable);
    VoucherResponse detail(String email, UUID id);
    VoucherResponse create(String email, VoucherRequest request);
    VoucherResponse update(String email, UUID id, VoucherRequest request);
    VoucherResponse submit(String email, UUID id);
    VoucherResponse approve(String email, UUID id);
    VoucherResponse reject(String email, UUID id, String reason);
    void delete(String email, UUID id);
    PaginatedResponse<AvailableVoucherResponse> available(String email, UUID stationId, UUID brandId, Pageable pageable);
    UserVoucherResponse claim(String email, UUID voucherId);
    PaginatedResponse<UserVoucherResponse> wallet(String email, UserVoucherStatus status, Pageable pageable);
    UserVoucherResponse downloadQr(String email, UUID id);
}
