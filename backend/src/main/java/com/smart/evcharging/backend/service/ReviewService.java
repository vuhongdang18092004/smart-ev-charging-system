package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.CreateReviewRequest;
import com.smart.evcharging.backend.dto.request.UpdateReviewRequest;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.ReviewResponse;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse create(UUID stationId, CreateReviewRequest request);
    ReviewResponse update(UUID id, UpdateReviewRequest request);
    void delete(UUID id);
    ReviewResponse detail(UUID id);
    PaginatedResponse<ReviewResponse> list(UUID stationId, Pageable pageable);
}
