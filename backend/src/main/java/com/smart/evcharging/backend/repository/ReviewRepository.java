package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.Review;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    boolean existsByStationIdAndDriverId(UUID stationId, UUID driverId);

    Page<Review> findByStationIdAndStationDeletedAtIsNull(UUID stationId, Pageable pageable);

    Optional<Review> findByIdAndStationDeletedAtIsNull(UUID id);

    @Query("select r.station.id from Review r where r.id = :id")
    Optional<UUID> findStationId(UUID id);

    @Query("select count(r) as ratingCount, coalesce(sum(r.rating), 0) as ratingSum from Review r where r.station.id = :stationId")
    RatingTotals ratingTotals(UUID stationId);

    interface RatingTotals {
        long getRatingCount();
        long getRatingSum();
    }
}
