package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.BlogPostRequest;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.BlogPostStatus;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface BlogPostService {
    BlogPostResponse create(String email, BlogPostRequest request);
    PaginatedResponse<BlogPostResponse> list(String email, BlogPostStatus status, UUID authorId, String keyword, Pageable pageable);
    BlogPostResponse detail(String email, UUID id);
    BlogPostResponse update(String email, UUID id, BlogPostRequest request);
    BlogPostResponse submit(String email, UUID id);
    BlogPostResponse approve(String email, UUID id);
    BlogPostResponse reject(String email, UUID id, String reason);
    void delete(String email, UUID id);
    PaginatedResponse<PublicBlogPostResponse> publicList(String keyword, Pageable pageable);
    PublicBlogPostResponse publicDetail(String slug);
}
