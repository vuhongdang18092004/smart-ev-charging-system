package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.CreateReviewRequest;
import com.smart.evcharging.backend.dto.request.UpdateReviewRequest;
import com.smart.evcharging.backend.dto.response.ApiResponse;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.ReviewResponse;
import com.smart.evcharging.backend.service.ReviewService;
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
public class ReviewController extends BaseController {
    private final ReviewService service;

    @PostMapping("/stations/{stationId}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @PathVariable UUID stationId, @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse result = service.create(stationId, request);
        return created(ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/reviews/{id}")
                .buildAndExpand(result.id()).toUri(), result);
    }

    @GetMapping("/stations/{stationId}/reviews")
    public ResponseEntity<ApiResponse<PaginatedResponse<ReviewResponse>>> list(
            @PathVariable UUID stationId, @PageableDefault(size = 10) Pageable pageable) {
        return ok(service.list(stationId, pageable));
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> detail(@PathVariable UUID id) {
        return ok(service.detail(id));
    }

    @PutMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateReviewRequest request) {
        return ok(service.update(id, request));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
