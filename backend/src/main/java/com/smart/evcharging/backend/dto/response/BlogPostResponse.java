package com.smart.evcharging.backend.dto.response;

import com.smart.evcharging.backend.entity.BlogPostStatus;
import java.time.Instant;
import java.util.UUID;

public record BlogPostResponse(
        UUID id, UUID authorId, String title, String slug, String summary, String content,
        String thumbnailUrl, BlogPostStatus status, String rejectionReason, UUID reviewedBy,
        Instant reviewedAt, Instant publishedAt, Instant createdAt, Instant updatedAt
) {}
