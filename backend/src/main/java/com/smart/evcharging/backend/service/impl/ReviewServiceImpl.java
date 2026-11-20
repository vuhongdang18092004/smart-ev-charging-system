package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.request.CreateReviewRequest;
import com.smart.evcharging.backend.dto.request.MediaRequest;
import com.smart.evcharging.backend.dto.request.UpdateReviewRequest;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.ReviewResponse;
import com.smart.evcharging.backend.entity.Review;
import com.smart.evcharging.backend.entity.ReviewMedia;
import com.smart.evcharging.backend.entity.Station;
import com.smart.evcharging.backend.repository.ReviewRepository;
import com.smart.evcharging.backend.repository.StationRepository;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import com.smart.evcharging.backend.service.ReviewService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviews;
    private final StationRepository stations;
    private final UserAccountRepository users;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReviewResponse create(UUID stationId, CreateReviewRequest request) {
        Station station = lockStation(stationId);
        Review review = new Review();
        review.setStation(station);
        review.setDriver(users.findByIdAndRoleAndDeletedAtIsNull(request.driverId(), DomainValues.DRIVER)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.INVALID_DRIVER, HttpStatus.BAD_REQUEST)));
        if (reviews.existsByStationIdAndDriverId(stationId, request.driverId())) {
            throw new CustomBusinessException(ErrorCodes.DUPLICATE_REVIEW, HttpStatus.CONFLICT);
        }
        review.setRating(request.rating());
        review.setComment(request.comment());
        replaceMedia(review, request.media());
        reviews.save(review);
        refreshStationRating(station);
        return toResponse(review);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReviewResponse update(UUID id, UpdateReviewRequest request) {
        Station station = lockStation(reviews.findStationId(id).orElseThrow(ReviewServiceImpl::notFound));
        Review review = reviews.findById(id).orElseThrow(ReviewServiceImpl::notFound);
        review.setRating(request.rating());
        review.setComment(request.comment());
        int editCount = Objects.requireNonNullElse(review.getEditCount(), (short) 0);
        review.setEditCount((short) Math.min(Short.MAX_VALUE, editCount + 1));
        replaceMedia(review, request.media());
        refreshStationRating(station);
        return toResponse(review);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(UUID id) {
        Station station = lockStation(reviews.findStationId(id).orElseThrow(ReviewServiceImpl::notFound));
        reviews.delete(reviews.findById(id).orElseThrow(ReviewServiceImpl::notFound));
        refreshStationRating(station);
    }

    @Override
    public ReviewResponse detail(UUID id) {
        return reviews.findByIdAndStationDeletedAtIsNull(id).map(ReviewServiceImpl::toResponse)
                .orElseThrow(ReviewServiceImpl::notFound);
    }

    @Override
    public PaginatedResponse<ReviewResponse> list(UUID stationId, Pageable pageable) {
        if (!stations.existsByIdAndDeletedAtIsNull(stationId)) {
            throw notFound();
        }
        Pageable ordered = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return PaginatedResponse.from(reviews.findByStationIdAndStationDeletedAtIsNull(stationId, ordered)
                .map(ReviewServiceImpl::toResponse));
    }

    private Station lockStation(UUID id) {
        return stations.findByIdAndDeletedAtIsNull(id).orElseThrow(ReviewServiceImpl::notFound);
    }

    private void refreshStationRating(Station station) {
        // The station lock serializes API writes before recomputing from committed reviews and this change.
        reviews.flush();
        ReviewRepository.RatingTotals totals = reviews.ratingTotals(station.getId());
        long count = totals.getRatingCount();
        BigDecimal average = count == 0 ? BigDecimal.ZERO.setScale(2)
                : BigDecimal.valueOf(totals.getRatingSum()).divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
        station.setAvgRating(average);
        station.setRatingCount(Math.toIntExact(count));
    }

    private static void replaceMedia(Review review, List<MediaRequest> requested) {
        if (requested == null) {
            return;
        }
        review.getMedia().clear();
        for (MediaRequest item : requested) {
            ReviewMedia attachment = new ReviewMedia();
            FeedbackMediaMapper.apply(attachment, item);
            review.addMedia(attachment);
        }
    }

    private static ReviewResponse toResponse(Review review) {
        return new ReviewResponse(review.getId(), review.getStation().getId(), review.getDriver().getId(),
                review.getRating(), review.getComment(), review.getEditCount(), review.getCreatedAt(),
                review.getUpdatedAt(), FeedbackMediaMapper.toResponses(review.getMedia()));
    }

    private static CustomBusinessException notFound() {
        return new CustomBusinessException(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
}
