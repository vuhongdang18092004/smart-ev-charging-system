package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.request.MediaRequest;
import com.smart.evcharging.backend.dto.request.StationReportRequest;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.StationReportResponse;
import com.smart.evcharging.backend.entity.StationReport;
import com.smart.evcharging.backend.entity.StationReportMedia;
import com.smart.evcharging.backend.repository.ConnectorTypeRepository;
import com.smart.evcharging.backend.repository.StationReportRepository;
import com.smart.evcharging.backend.repository.StationRepository;
import com.smart.evcharging.backend.repository.UserAccountRepository;
import com.smart.evcharging.backend.service.StationReportService;
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
public class StationReportServiceImpl implements StationReportService {
    private final StationReportRepository reports;
    private final StationRepository stations;
    private final UserAccountRepository users;
    private final ConnectorTypeRepository connectorTypes;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StationReportResponse create(UUID stationId, StationReportRequest request) {
        StationReport report = new StationReport();
        report.setStation(stations.findByIdAndDeletedAtIsNull(stationId).orElseThrow(StationReportServiceImpl::notFound));
        report.setDriver(users.findByIdAndRoleAndDeletedAtIsNull(request.driverId(), DomainValues.DRIVER)
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.INVALID_DRIVER, HttpStatus.BAD_REQUEST)));
        if (request.connectorTypeId() != null) {
            report.setConnectorType(connectorTypes.findById(request.connectorTypeId())
                    .orElseThrow(() -> new CustomBusinessException(ErrorCodes.INVALID_CONNECTOR_TYPE, HttpStatus.BAD_REQUEST)));
        }
        report.setIssueType(request.issueType());
        report.setNote(request.note());
        report.setStatus(DomainValues.DEFAULT_REPORT_STATUS);
        if (request.media() != null) {
            for (MediaRequest item : request.media()) {
                StationReportMedia attachment = new StationReportMedia();
                FeedbackMediaMapper.apply(attachment, item);
                report.addMedia(attachment);
            }
        }
        return toResponse(reports.saveAndFlush(report));
    }

    @Override
    public StationReportResponse detail(UUID id) {
        return reports.findByIdAndStationDeletedAtIsNull(id).map(StationReportServiceImpl::toResponse)
                .orElseThrow(StationReportServiceImpl::notFound);
    }

    @Override
    public PaginatedResponse<StationReportResponse> list(UUID stationId, Pageable pageable) {
        if (!stations.existsByIdAndDeletedAtIsNull(stationId)) {
            throw notFound();
        }
        Pageable ordered = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return PaginatedResponse.from(reports.findByStationIdAndStationDeletedAtIsNull(stationId, ordered)
                .map(StationReportServiceImpl::toResponse));
    }

    private static StationReportResponse toResponse(StationReport report) {
        return new StationReportResponse(report.getId(), report.getStation().getId(), report.getDriver().getId(),
                report.getConnectorType() == null ? null : report.getConnectorType().getId(),
                report.getIssueType(), report.getNote(), report.getStatus(), report.getCreatedAt(),
                report.getUpdatedAt(), FeedbackMediaMapper.toResponses(report.getMedia()));
    }

    private static CustomBusinessException notFound() {
        return new CustomBusinessException(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
}
