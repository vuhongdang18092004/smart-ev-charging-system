package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseTrackedEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

@Getter
@Setter
@Entity
@Table(name = "reviews")
public class Review extends BaseTrackedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id", nullable = false)
    private UserAccount driver;

    @Column(nullable = false)
    private short rating;

    @Column(columnDefinition = "text")
    private String comment;

    @Column(name = "edit_count")
    private Short editCount = 0;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    @BatchSize(size = 32)
    private List<ReviewMedia> media = new ArrayList<>();

    public void addMedia(ReviewMedia attachment) {
        attachment.setReview(this);
        media.add(attachment);
    }
}
