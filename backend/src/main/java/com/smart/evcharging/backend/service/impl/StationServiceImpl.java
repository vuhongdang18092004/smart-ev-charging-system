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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StationServiceImpl extends BaseServiceImpl<Station, UUID> implements StationService {
    private static final Comparator<StationImage> IMAGE_ORDER = Comparator.comparingInt(StationImage::getSortOrder)
            .thenComparing(StationImage::getId);
    private final StationRepository stations;
    private final ConnectorRepository connectors;
    private final ConnectorTypeRepository connectorTypes;
    private final BrandRepository brands;
    private final UserAccountRepository users;
    private final OperatorProfileRepository profiles;

    public StationServiceImpl(StationRepository stations, ConnectorRepository connectors,
            ConnectorTypeRepository connectorTypes, BrandRepository brands, UserAccountRepository users,
            OperatorProfileRepository profiles) {
        super(stations);
        this.stations = stations;
        this.connectors = connectors;
        this.connectorTypes = connectorTypes;
        this.brands = brands;
        this.users = users;
        this.profiles = profiles;
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
        UUID ownerId = currentOperatorId();
        UUID operatorId = ownerId == null ? filter.operatorId() : ownerId;
        if (operatorId != null) {
            matches = matches.and((root, query, cb) -> cb.equal(root.get("operator").get("id"), operatorId));
        }
        if (filter.status() != null) {
            matches = matches.and((root, query, cb) -> cb.equal(root.get("status"), filter.status()));
        }
        if (filter.locationType() != null) {
            matches = matches.and((root, query, cb) -> cb.equal(root.get("locationType"), filter.locationType()));
        }
        if (filter.parkingFeeType() != null) {
            matches = matches.and((root, query, cb) -> cb.equal(root.get("parkingFeeType"), filter.parkingFeeType()));
        }
        Pageable stablePage = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("name", "id"));
        return PaginatedResponse.from(stations.findAll(matches, stablePage).map(StationServiceImpl::toStation));
    }

    @Override
    public StationDetailResponse detail(UUID id) {
        Station station = findById(id);
        requireOwner(station);
        List<ConnectorResponse> items = connectors.findByStationIdOrderById(id).stream()
                .map(StationServiceImpl::toConnector).toList();
        return new StationDetailResponse(toStation(station), items);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StationDetailResponse create(CreateStationRequest request) {
        Station station = new Station();
        applyStation(station, request.station());
        if (request.images() != null && request.station().images() != null) {
            throw invalidReference(ErrorCodes.AMBIGUOUS_STATION_IMAGES);
        }
        replaceImages(station, request.images() == null ? request.station().images() : request.images());
        stations.save(station);
        Set<String> reservedCodes = new HashSet<>();
        List<ConnectorResponse> items = request.connectors() == null ? List.of() : request.connectors().stream()
                .flatMap(group -> createConnectors(station, group, reservedCodes).stream()).toList();
        stations.flush();
        return new StationDetailResponse(toStation(station), items);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StationResponse update(UUID id, StationRequest request) {
        Station station = lockStation(id);
        applyStation(station, request);
        replaceImages(station, request.images());
        stations.flush();
        return toStation(station);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        lockStation(id).markDeleted(Instant.now());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StationImageResponse addImage(UUID stationId, StationImageRequest request) {
        Station station = lockStation(stationId);
        boolean primary = Boolean.TRUE.equals(request.isPrimary()) || station.getImages().isEmpty();
        if (primary) {
            station.getImages().forEach(image -> image.setPrimary(false));
        }
        StationImage image = newImage(request, primary);
        station.addImage(image);
        stations.flush();
        return toImage(image);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteImage(UUID stationId, UUID imageId) {
        Station station = lockStation(stationId);
        StationImage deleted = station.getImages().stream().filter(image -> imageId.equals(image.getId()))
                .findFirst().orElseThrow(StationServiceImpl::notFound);
        station.getImages().remove(deleted);
        if (deleted.isPrimary()) {
            station.getImages().stream().min(IMAGE_ORDER).ifPresent(image -> image.setPrimary(true));
        }
    }

    private static void replaceImages(Station station, List<StationImageRequest> requested) {
        if (requested == null) {
            return;
        }
        station.getImages().clear();
        int primaryIndex = 0;
        for (int index = 0; index < requested.size(); index++) {
            if (Boolean.TRUE.equals(requested.get(index).isPrimary())) {
                primaryIndex = index;
                break;
            }
        }
        for (int index = 0; index < requested.size(); index++) {
            station.addImage(newImage(requested.get(index), index == primaryIndex));
        }
    }

    private static StationImage newImage(StationImageRequest request, boolean primary) {
        StationImage image = new StationImage();
        image.setUrl(request.url());
        image.setCaption(request.caption());
        image.setPrimary(primary);
        image.setSortOrder(Objects.requireNonNullElse(request.sortOrder(), 0));
        return image;
    }

    private static StationImageResponse toImage(StationImage image) {
        return new StationImageResponse(image.getId(), image.getUrl(), image.getCaption(), image.isPrimary(),
                image.getSortOrder());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<ConnectorResponse> addConnectors(UUID stationId, CreateConnectorsRequest request) {
        Station station = lockStation(stationId);
        return createConnectors(station, request, new HashSet<>(connectors.findCodesByStationId(stationId)));
    }

    @Override
    @Transactional
    public ConnectorResponse updateConnector(UUID id, ConnectorRequest request) {
        Connector connector = lockConnectorStation(id);
        if (request.code() != null && !request.code().isBlank()) {
            String code = request.code().strip();
            if (connectors.existsByStationIdAndCodeAndIdNot(connector.getStation().getId(), code, id)) {
                throw duplicateConnectorCode();
            }
            connector.setCode(code);
        }
        connector.setConnectorType(findConnectorType(request.connectorTypeId()));
        connector.setPowerKw(request.powerKw());
        if (request.status() != null) {
            connector.setStatus(request.status());
        }
        return toConnector(connector);
    }

    @Override
    @Transactional
    public void deleteConnector(UUID id) {
        connectors.delete(lockConnectorStation(id));
    }

    private Station lockStation(UUID id) {
        Station station = stations.findByIdAndDeletedAtIsNull(id).orElseThrow(StationServiceImpl::notFound);
        requireOwner(station);
        return station;
    }

    private UUID currentOperatorId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_OPERATOR"))) {
            return null;
        }
        UUID id = users.findLoginId(authentication.getName()).orElseThrow(StationServiceImpl::notFound);
        if (!profiles.existsById(id)) throw notFound();
        return id;
    }

    private void requireOwner(Station station) {
        UUID operatorId = currentOperatorId();
        if (operatorId != null && !operatorId.equals(station.getOperator().getId())) {
            throw notFound();
        }
    }

    private Connector lockConnectorStation(UUID id) {
        lockStation(connectors.findStationId(id).orElseThrow(StationServiceImpl::notFound));
        return connectors.findById(id).orElseThrow(StationServiceImpl::notFound);
    }

    private void applyStation(Station station, StationRequest request) {
        UUID operatorId = currentOperatorId();
        if (operatorId != null && request.operatorId() != null && !operatorId.equals(request.operatorId())) {
            throw new AccessDeniedException(ErrorCodes.OPERATOR_NOT_FOUND);
        }
        UUID ownerId = operatorId == null ? request.operatorId() : operatorId;
        if (ownerId == null) throw invalidReference(ErrorCodes.INVALID_OPERATOR);
        station.setOperator(users.findByIdAndRoleAndDeletedAtIsNull(ownerId, DomainValues.OPERATOR)
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
        if (request.pricePerKwh() != null) {
            station.setPricePerKwh(request.pricePerKwh());
        }
        if (request.phone() != null) {
            station.setPhone(request.phone().isBlank() ? null : request.phone().strip());
        }
        if (request.locationType() != null) {
            station.setLocationType(request.locationType());
        }
        if (request.parkingFeeType() != null) {
            station.setParkingFeeType(request.parkingFeeType());
        }
    }

    private List<ConnectorResponse> createConnectors(Station station, CreateConnectorsRequest request,
            Set<String> reservedCodes) {
        int quantity = Objects.requireNonNullElse(request.quantity(), 1);
        String exactCode = Objects.requireNonNullElse(request.code(), "").strip();
        String prefix = Objects.requireNonNullElse(request.codePrefix(), "").strip();
        if (!exactCode.isEmpty() && (quantity != 1 || !prefix.isEmpty())) {
            throw invalidReference(ErrorCodes.INVALID_CONNECTOR_CODE_GROUP);
        }
        if (!exactCode.isEmpty() && !reservedCodes.add(exactCode)) {
            throw duplicateConnectorCode();
        }

        ConnectorType type = findConnectorType(request.connectorTypeId());
        String baseCode = prefix.isEmpty() ? "#" : prefix + "-";
        List<Connector> ports = new ArrayList<>(quantity);
        int nextNumber = 1;
        for (int index = 0; index < quantity; index++) {
            String code = exactCode;
            if (code.isEmpty()) {
                do {
                    code = baseCode + nextNumber++;
                } while (!reservedCodes.add(code));
            }
            Connector connector = new Connector();
            connector.setStation(station);
            connector.setConnectorType(type);
            connector.setPowerKw(request.powerKw());
            connector.setCode(code);
            connector.setStatus(Objects.requireNonNullElse(request.status(), DomainValues.DEFAULT_CONNECTOR_STATUS));
            ports.add(connector);
        }
        return connectors.saveAll(ports).stream().map(StationServiceImpl::toConnector).toList();
    }

    private ConnectorType findConnectorType(UUID id) {
        return connectorTypes.findById(id)
                .orElseThrow(() -> invalidReference(ErrorCodes.INVALID_CONNECTOR_TYPE));
    }

    private static CustomBusinessException duplicateConnectorCode() {
        return new CustomBusinessException(ErrorCodes.DUPLICATE_STATION_CONNECTOR_CODE, HttpStatus.CONFLICT);
    }

    private static StationResponse toStation(Station station) {
        return new StationResponse(station.getId(), station.getOperator().getId(), station.getBrand().getId(),
                station.getName(), station.getAddress(), station.getLat(), station.getLng(), station.getStatus(),
                station.getIs24_7(), station.getOpeningTime(), station.getClosingTime(), station.getAccessType(),
                station.getSourceUrl(), station.getLastSyncedAt(), station.getCreatedAt(), station.getUpdatedAt(),
                station.getLocationType(), station.getParkingFeeType(), station.getAvgRating(), station.getRatingCount(),
                station.getImages().stream().sorted(IMAGE_ORDER).map(StationServiceImpl::toImage).toList(),
                station.getPricePerKwh(), station.getPhone());
    }

    private static ConnectorResponse toConnector(Connector connector) {
        return new ConnectorResponse(connector.getId(), connector.getStation().getId(),
                connector.getConnectorType().getId(), connector.getPowerKw(),
                connector.getCode(), connector.getStatus());
    }

    private static CustomBusinessException notFound() {
        return new CustomBusinessException(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    private static CustomBusinessException invalidReference(String code) {
        return new CustomBusinessException(code, HttpStatus.BAD_REQUEST);
    }
}
