package com.smart.evcharging.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PublicBlogPostResponse(
        UUID id, String title, String slug, String summary, String content, String thumbnailUrl, Instant publishedAt
) {}
