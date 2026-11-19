package com.smart.evcharging.backend.common.base;

import com.smart.evcharging.backend.dto.response.ApiResponse;
import java.net.URI;
import org.springframework.http.ResponseEntity;

public abstract class BaseController {
    protected <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    protected <T> ResponseEntity<ApiResponse<T>> created(URI location, T data) {
        return ResponseEntity.created(location).body(ApiResponse.success(data));
    }
}
