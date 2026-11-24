package com.smart.evcharging.backend.controller;

import com.smart.evcharging.backend.common.base.BaseController;
import com.smart.evcharging.backend.dto.request.BlogPostRejectRequest;
import com.smart.evcharging.backend.dto.request.BlogPostRequest;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.BlogPostStatus;
import com.smart.evcharging.backend.service.BlogPostService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/blog-posts")
public class BlogPostController extends BaseController {
    private final BlogPostService service;

    @PostMapping
    public ResponseEntity<ApiResponse<BlogPostResponse>> create(Principal principal,
            @Valid @RequestBody BlogPostRequest request) {
        BlogPostResponse post = service.create(principal.getName(), request);
        return created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(post.id()).toUri(), post);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<BlogPostResponse>>> list(Principal principal,
            @RequestParam(required = false) BlogPostStatus status, @RequestParam(required = false) UUID authorId,
            @RequestParam(required = false) String keyword, Pageable pageable) {
        return ok(service.list(principal.getName(), status, authorId, keyword, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogPostResponse>> detail(Principal principal, @PathVariable UUID id) {
        return ok(service.detail(principal.getName(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogPostResponse>> update(Principal principal, @PathVariable UUID id,
            @Valid @RequestBody BlogPostRequest request) {
        return ok(service.update(principal.getName(), id, request));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<BlogPostResponse>> submit(Principal principal, @PathVariable UUID id) {
        return ok(service.submit(principal.getName(), id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BlogPostResponse>> approve(Principal principal, @PathVariable UUID id) {
        return ok(service.approve(principal.getName(), id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BlogPostResponse>> reject(Principal principal, @PathVariable UUID id,
            @Valid @RequestBody BlogPostRejectRequest request) {
        return ok(service.reject(principal.getName(), id, request.rejectionReason()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable UUID id) {
        service.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
