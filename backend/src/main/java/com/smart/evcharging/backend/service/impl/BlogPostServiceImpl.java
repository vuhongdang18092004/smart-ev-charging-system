package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.request.BlogPostRequest;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.BlogPost;
import com.smart.evcharging.backend.entity.BlogPostStatus;
import com.smart.evcharging.backend.entity.UserAccount;
import com.smart.evcharging.backend.repository.BlogPostRepository;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import com.smart.evcharging.backend.service.BlogPostService;
import java.text.Normalizer;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.smart.evcharging.backend.entity.BlogPostStatus.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlogPostServiceImpl implements BlogPostService {
    private final BlogPostRepository posts;
    private final UserAccountRepository users;

    @Override
    @Transactional
    public BlogPostResponse create(String email, BlogPostRequest request) {
        UserAccount author = actor(email);
        BlogPostStatus status = request.status() == null ? DRAFT : request.status();
        if (!isAdmin(author) && status == PUBLISHED) throw forbidden();
        if (status != DRAFT && status != (isAdmin(author) ? PUBLISHED : PENDING_REVIEW)) {
            throw invalidStatus();
        }
        BlogPost post = new BlogPost();
        post.setAuthorId(author.getId());
        applyContent(post, request);
        post.setSlug(allocateSlug(post.getTitle()));
        post.setStatus(status);
        if (status == PUBLISHED) post.setPublishedAt(Instant.now());
        return response(posts.saveAndFlush(post), true);
    }

    @Override
    public PaginatedResponse<BlogPostResponse> list(String email, BlogPostStatus status,
            UUID authorId, String keyword, Pageable pageable) {
        UserAccount user = actor(email);
        UUID owner = isAdmin(user) ? authorId : user.getId();
        Specification<BlogPost> spec = filtered(status, keyword);
        if (owner != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("authorId"), owner));
        }
        return PaginatedResponse.from(posts.findAll(spec, ordered(pageable, "createdAt"))
                .map(post -> response(post, false)));
    }

    @Override
    public BlogPostResponse detail(String email, UUID id) {
        UserAccount user = actor(email);
        BlogPost post = posts.findByIdAndDeletedAtIsNull(id).orElseThrow(BlogPostServiceImpl::notFound);
        requireOwner(user, post);
        return response(post, true);
    }

    @Override
    @Transactional
    public BlogPostResponse update(String email, UUID id, BlogPostRequest request) {
        UserAccount user = actor(email);
        BlogPost post = lockPost(id);
        requireEditable(user, post);
        BlogPostStatus target = request.status();
        if (target != null && target != post.getStatus()) {
            if (!isAdmin(user)) throw forbidden();
            changeAdminStatus(post, target);
        }
        applyContent(post, request);
        return saveResponse(post);
    }

    @Override
    @Transactional
    public BlogPostResponse submit(String email, UUID id) {
        UserAccount user = actor(email);
        if (isAdmin(user)) throw forbidden();
        BlogPost post = lockPost(id);
        requireEditable(user, post);
        post.setStatus(PENDING_REVIEW);
        post.setRejectionReason(null);
        post.setReviewedBy(null);
        post.setReviewedAt(null);
        return saveResponse(post);
    }

    @Override
    @Transactional
    public BlogPostResponse approve(String email, UUID id) {
        BlogPost post = reviewPending(email, id);
        post.setStatus(PUBLISHED);
        post.setPublishedAt(post.getReviewedAt());
        post.setRejectionReason(null);
        return saveResponse(post);
    }

    @Override
    @Transactional
    public BlogPostResponse reject(String email, UUID id, String reason) {
        BlogPost post = reviewPending(email, id);
        post.setStatus(REJECTED);
        post.setRejectionReason(reason.strip());
        return saveResponse(post);
    }

    @Override
    @Transactional
    public void delete(String email, UUID id) {
        UserAccount user = actor(email);
        BlogPost post = lockPost(id);
        requireEditable(user, post);
        post.markDeleted(Instant.now());
    }

    @Override
    public PaginatedResponse<PublicBlogPostResponse> publicList(String keyword, Pageable pageable) {
        return PaginatedResponse.from(posts.findAll(filtered(PUBLISHED, keyword), ordered(pageable, "publishedAt"))
                .map(post -> publicResponse(post, false)));
    }

    @Override
    public PublicBlogPostResponse publicDetail(String slug) {
        return posts.findBySlugAndStatusAndDeletedAtIsNull(slug, PUBLISHED)
                .map(post -> publicResponse(post, true)).orElseThrow(BlogPostServiceImpl::notFound);
    }

    private BlogPost reviewPending(String email, UUID id) {
        UserAccount admin = actor(email);
        if (!isAdmin(admin)) throw forbidden();
        BlogPost post = lockPost(id);
        if (post.getStatus() != PENDING_REVIEW) throw invalidStatus();
        post.setReviewedBy(admin.getId());
        post.setReviewedAt(Instant.now());
        return post;
    }

    private UserAccount actor(String email) {
        return users.findByLoginEmail(email)
                .filter(user -> DomainValues.ADMIN.equals(user.getRole()) || DomainValues.OPERATOR.equals(user.getRole()))
                .orElseThrow(BlogPostServiceImpl::forbidden);
    }

    private static boolean isAdmin(UserAccount user) {
        return DomainValues.ADMIN.equals(user.getRole());
    }

    private static void requireOwner(UserAccount user, BlogPost post) {
        if (!isAdmin(user) && !user.getId().equals(post.getAuthorId())) throw forbidden();
    }

    private static void requireEditable(UserAccount user, BlogPost post) {
        requireOwner(user, post);
        if (!isAdmin(user) && post.getStatus() != DRAFT && post.getStatus() != REJECTED) throw forbidden();
    }

    private static void changeAdminStatus(BlogPost post, BlogPostStatus target) {
        BlogPostStatus current = post.getStatus();
        if (target == PUBLISHED && (current == DRAFT || current == ARCHIVED)) {
            post.setPublishedAt(Instant.now());
            post.setRejectionReason(null);
        } else if (target != ARCHIVED && !(target == DRAFT && current == ARCHIVED)) {
            throw invalidStatus();
        }
        post.setStatus(target);
    }

    private BlogPost lockPost(UUID id) {
        return posts.lockActive(id).orElseThrow(BlogPostServiceImpl::notFound);
    }

    private BlogPostResponse saveResponse(BlogPost post) {
        posts.flush();
        return response(post, true);
    }

    private String allocateSlug(String title) {
        String base = Normalizer.normalize(title.toLowerCase(Locale.ROOT), Normalizer.Form.NFKD)
                .replace('đ', 'd').replaceAll("\\p{M}", "").replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        if (base.isEmpty()) base = "bai-viet";
        if (base.length() > 255) base = base.substring(0, 255).replaceAll("-$", "");

        // Serialize allocations so concurrent creates cannot claim the same slug.
        posts.lockSlugAllocation();
        String slug = base;
        for (int suffix = 2; posts.existsBySlug(slug); suffix++) {
            slug = base + "-" + suffix;
        }
        return slug;
    }

    private static void applyContent(BlogPost post, BlogPostRequest request) {
        post.setTitle(request.title().strip());
        post.setSummary(request.summary());
        post.setContent(request.content());
        post.setThumbnailUrl(request.thumbnailUrl());
    }

    private static Specification<BlogPost> filtered(BlogPostStatus status, String keyword) {
        Specification<BlogPost> spec = (root, query, cb) -> cb.isNull(root.get("deletedAt"));
        if (status != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        if (keyword != null && !keyword.isBlank()) {
            String term = keyword.strip().toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, cb) -> cb.gt(cb.locate(cb.lower(root.get("title")), term), 0));
        }
        return spec;
    }

    private static Pageable ordered(Pageable pageable, String field) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, field, "id"));
    }

    private static BlogPostResponse response(BlogPost post, boolean includeContent) {
        return new BlogPostResponse(post.getId(), post.getAuthorId(), post.getTitle(), post.getSlug(), post.getSummary(),
                includeContent ? post.getContent() : null, post.getThumbnailUrl(), post.getStatus(), post.getRejectionReason(),
                post.getReviewedBy(), post.getReviewedAt(), post.getPublishedAt(), post.getCreatedAt(), post.getUpdatedAt());
    }

    private static PublicBlogPostResponse publicResponse(BlogPost post, boolean includeContent) {
        return new PublicBlogPostResponse(post.getId(), post.getTitle(), post.getSlug(), post.getSummary(),
                includeContent ? post.getContent() : null, post.getThumbnailUrl(), post.getPublishedAt());
    }

    private static CustomBusinessException forbidden() {
        return new CustomBusinessException(ErrorCodes.BLOG_FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    private static CustomBusinessException invalidStatus() {
        return new CustomBusinessException(ErrorCodes.BLOG_INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    private static CustomBusinessException notFound() {
        return new CustomBusinessException(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
}
