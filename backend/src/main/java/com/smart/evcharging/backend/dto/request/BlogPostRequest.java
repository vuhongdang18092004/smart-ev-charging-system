package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.entity.BlogPostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record BlogPostRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 500) String summary,
        @NotBlank String content,
        @Size(max = 500) @URL(regexp = "https?://.*") String thumbnailUrl,
        BlogPostStatus status
) {}
