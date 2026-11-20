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
@Table(name = "station_reports")
public class StationReport extends BaseTrackedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id", nullable = false)
    private UserAccount driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connector_type_id")
    private ConnectorType connectorType;

    @Column(name = "issue_type", nullable = false, length = 30)
    private String issueType;

    @Column(columnDefinition = "text")
    private String note;

    @Column(length = 20)
    private String status;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    @BatchSize(size = 32)
    private List<StationReportMedia> media = new ArrayList<>();

    public void addMedia(StationReportMedia attachment) {
        attachment.setReport(this);
        media.add(attachment);
    }
}
