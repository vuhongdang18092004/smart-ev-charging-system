package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.common.base.BaseServiceImpl;
import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.request.*;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.*;
import com.smart.evcharging.backend.repository.*;
import com.smart.evcharging.backend.service.StationService;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StationServiceImpl extends BaseServiceImpl<Station, UUID> implements StationService {
    private final StationRepository stations;
    private final ConnectorRepository connectors;
    private final ConnectorTypeRepository connectorTypes;
    private final BrandRepository brands;
    private final UserAccountRepository users;

    public StationServiceImpl(StationRepository stations, ConnectorRepository connectors,
            ConnectorTypeRepository connectorTypes, BrandRepository brands, UserAccountRepository users) {
        super(stations);
        this.stations = stations;
        this.connectors = connectors;
        this.connectorTypes = connectorTypes;
        this.brands = brands;
        this.users = users;
    }

    @Override
    public PaginatedResponse<StationResponse> search(StationFilter filter, Pageable pageable) {
        Specification<Station> matches = active();
        if (filter.keyword() != null && !filter.keyword().isBlank()) {
            String keyword = filter.keyword().strip().toLowerCase(Locale.ROOT)
                    .replace("!", "!!").replace("%", "!%").replace("_", "!_");
            String pattern = "%" + keyword + "%";
            matches = matches.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern, '!'),
                    cb.like(cb.lower(root.get("address")), pattern, '!')));
        }
        if (filter.brandId() != null) {
            matches = matches.and((root, query, cb) -> cb.equal(root.get("brand").get("id"), filter.brandId()));
        }
        if (filter.operatorId() != null) {
            matches = matches.and((root, query, cb) -> cb.equal(root.get("operator").get("id"), filter.operatorId()));
        }
        if (filter.status() != null) {
            matches = matches.and((root, query, cb) -> cb.equal(root.get("status"), filter.status()));
        }
        Pageable stablePage = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("name", "id"));
        return PaginatedResponse.from(stations.findAll(matches, stablePage).map(StationServiceImpl::toStation));
    }

    @Override
    public StationDetailResponse detail(UUID id) {
        Station station = findById(id);
        List<ConnectorResponse> items = connectors.findByStationIdOrderById(id).stream()
                .map(StationServiceImpl::toConnector).toList();
        return new StationDetailResponse(toStation(station), items);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StationDetailResponse create(CreateStationRequest request) {
        Station station = new Station();
        applyStation(station, request.station());
        stations.save(station);
        List<ConnectorResponse> items = request.connectors() == null ? List.of() : request.connectors().stream()
                .map(connector -> createConnector(station, connector)).toList();
        stations.flush();
        return new StationDetailResponse(toStation(station), items);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StationResponse update(UUID id, StationRequest request) {
        Station station = lockStation(id);
        applyStation(station, request);
        stations.flush();
        return toStation(station);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        lockStation(id).markDeleted(Instant.now());
    }

    @Override
    @Transactional
    public ConnectorResponse addConnector(UUID stationId, ConnectorRequest request) {
        return createConnector(lockStation(stationId), request);
    }

    @Override
    @Transactional
    public ConnectorResponse updateConnector(UUID id, ConnectorRequest request) {
        Connector connector = lockConnectorStation(id);
        applyConnector(connector, request);
        return toConnector(connector);
    }

    @Override
    @Transactional
    public void deleteConnector(UUID id) {
        connectors.delete(lockConnectorStation(id));
    }

    private Station lockStation(UUID id) {
        return stations.findByIdAndDeletedAtIsNull(id).orElseThrow(StationServiceImpl::notFound);
    }

    private Connector lockConnectorStation(UUID id) {
        lockStation(connectors.findStationId(id).orElseThrow(StationServiceImpl::notFound));
        return connectors.findById(id).orElseThrow(StationServiceImpl::notFound);
    }

    private void applyStation(Station station, StationRequest request) {
        station.setOperator(users.findByIdAndRoleAndDeletedAtIsNull(request.operatorId(), DomainValues.OPERATOR)
                .orElseThrow(() -> invalidReference(ErrorCodes.INVALID_OPERATOR)));
        station.setBrand(brands.findById(request.brandId())
                .orElseThrow(() -> invalidReference(ErrorCodes.INVALID_BRAND)));
        station.setName(request.name().strip());
        station.setAddress(request.address().strip());
        station.setLat(request.lat());
        station.setLng(request.lng());
        station.setStatus(Objects.requireNonNullElse(request.status(), DomainValues.DEFAULT_STATION_STATUS));
        station.setIs24_7(Objects.requireNonNullElse(request.is24_7(), false));
        station.setOpeningTime(request.openingTime());
        station.setClosingTime(request.closingTime());
        station.setAccessType(Objects.requireNonNullElse(request.accessType(), DomainValues.DEFAULT_STATION_ACCESS));
        station.setSourceUrl(request.sourceUrl());
    }

    private ConnectorResponse createConnector(Station station, ConnectorRequest request) {
        Connector connector = new Connector();
        connector.setStation(station);
        applyConnector(connector, request);
        return toConnector(connectors.save(connector));
    }

    private void applyConnector(Connector connector, ConnectorRequest request) {
        connector.setConnectorType(connectorTypes.findById(request.connectorTypeId())
                .orElseThrow(() -> invalidReference(ErrorCodes.INVALID_CONNECTOR_TYPE)));
        connector.setPowerKw(request.powerKw());
        connector.setQuantity(Objects.requireNonNullElse(request.quantity(), 1));
        connector.setPricePerKwh(request.pricePerKwh());
    }

    private static StationResponse toStation(Station station) {
        return new StationResponse(station.getId(), station.getOperator().getId(), station.getBrand().getId(),
                station.getName(), station.getAddress(), station.getLat(), station.getLng(), station.getStatus(),
                station.getIs24_7(), station.getOpeningTime(), station.getClosingTime(), station.getAccessType(),
                station.getSourceUrl(), station.getLastSyncedAt(), station.getCreatedAt(), station.getUpdatedAt());
    }

    private static ConnectorResponse toConnector(Connector connector) {
        return new ConnectorResponse(connector.getId(), connector.getStation().getId(),
                connector.getConnectorType().getId(), connector.getPowerKw(), connector.getQuantity(),
                connector.getPricePerKwh());
    }

    private static CustomBusinessException notFound() {
        return new CustomBusinessException(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    private static CustomBusinessException invalidReference(String code) {
        return new CustomBusinessException(code, HttpStatus.BAD_REQUEST);
    }
}
