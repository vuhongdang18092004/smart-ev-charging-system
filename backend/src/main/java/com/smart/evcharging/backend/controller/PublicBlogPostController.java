package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.response.ApiResponse;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.PublicBlogPostResponse;
import com.smart.evcharging.backend.service.BlogPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public/blog-posts")
public class PublicBlogPostController extends BaseController {
    private final BlogPostService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<PublicBlogPostResponse>>> list(
            @RequestParam(required = false) String keyword, Pageable pageable) {
        return ok(service.publicList(keyword, pageable));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PublicBlogPostResponse>> detail(@PathVariable String slug) {
        return ok(service.publicDetail(slug));
    }
}
