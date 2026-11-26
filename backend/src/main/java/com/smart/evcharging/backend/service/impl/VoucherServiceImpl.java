package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.dto.request.VoucherRequest;
import com.smart.evcharging.backend.dto.response.*;
import com.smart.evcharging.backend.entity.*;
import com.smart.evcharging.backend.repository.*;
import com.smart.evcharging.backend.service.VoucherService;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import jakarta.persistence.criteria.JoinType;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.smart.evcharging.backend.entity.VoucherStatus.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoucherServiceImpl implements VoucherService {
    private static final DateTimeFormatter QR_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    private final VoucherRepository vouchers;
    private final UserVoucherRepository claims;
    private final UserAccountRepository users;
    private final StationRepository stations;
    private final BrandRepository brands;

    @Override
    public PaginatedResponse<VoucherResponse> list(String email, VoucherStatus status,
            String keyword, UUID stationId, Pageable pageable) {
        UserAccount user = manager(email);
        Instant now = Instant.now();
        Specification<Voucher> spec = activeRows();
        if (!admin(user)) spec = spec.and((root, query, cb) -> cb.equal(root.get("creatorId"), user.getId()));
        if (stationId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("station").get("id"), stationId));
        if (status != null) spec = spec.and(campaignFilter(status, now));
        if (keyword != null && !keyword.isBlank()) {
            String term = keyword.strip().toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.gt(cb.locate(cb.lower(root.get("title")), term), 0),
                    cb.gt(cb.locate(cb.lower(root.get("codePrefix")), term), 0)));
        }
        return PaginatedResponse.from(vouchers.findAll(spec, ordered(pageable, "createdAt"))
                .map(voucher -> managed(voucher, now)));
    }

    @Override
    public VoucherResponse detail(String email, UUID id) {
        UserAccount user = manager(email);
        Voucher voucher = vouchers.findByIdAndDeletedAtIsNull(id).orElseThrow(VoucherServiceImpl::notFound);
        requireOwner(user, voucher);
        return managed(voucher, Instant.now());
    }

    @Override
    @Transactional
    public VoucherResponse create(String email, VoucherRequest request) {
        UserAccount user = manager(email);
        VoucherStatus status = request.status() == null ? DRAFT : request.status();
        if (!admin(user) && status == ACTIVE) throw forbidden();
        if (status != DRAFT && status != (admin(user) ? ACTIVE : PENDING_APPROVAL)) throw invalidStatus();
        Voucher voucher = new Voucher();
        voucher.setCreatorId(user.getId());
        apply(voucher, user, request);
        applyStatus(voucher, status);
        return managed(vouchers.saveAndFlush(voucher), Instant.now());
    }

    @Override
    @Transactional
    public VoucherResponse update(String email, UUID id, VoucherRequest request) {
        UserAccount user = manager(email);
        Voucher voucher = locked(id);
        requireEditable(user, voucher);
        VoucherStatus target = request.status();
        if (target != null && target != voucher.getStatus()) {
            if (!admin(user)) throw forbidden();
            boolean allowed = target == INACTIVE && voucher.getStatus() == ACTIVE
                    || target == ACTIVE && (voucher.getStatus() == DRAFT || voucher.getStatus() == INACTIVE);
            if (!allowed) throw invalidStatus();
        }
        apply(voucher, user, request);
        if (target != null) applyStatus(voucher, target);
        return managed(voucher, Instant.now());
    }

    @Override
    @Transactional
    public VoucherResponse submit(String email, UUID id) {
        UserAccount user = actor(email, DomainValues.OPERATOR);
        Voucher voucher = locked(id);
        requireEditable(user, voucher);
        verifyOperatorStation(user, voucher.getStation() == null ? null : voucher.getStation().getId());
        applyStatus(voucher, PENDING_APPROVAL);
        voucher.setRejectionReason(null);
        voucher.setReviewedBy(null);
        voucher.setReviewedAt(null);
        return managed(voucher, Instant.now());
    }

    @Override
    @Transactional
    public VoucherResponse approve(String email, UUID id) {
        Voucher voucher = review(email, id);
        verifyOperatorStation(voucher.getCreatorId(), voucher.getStation() == null ? null : voucher.getStation().getId());
        applyStatus(voucher, ACTIVE);
        voucher.setRejectionReason(null);
        return managed(voucher, Instant.now());
    }

    @Override
    @Transactional
    public VoucherResponse reject(String email, UUID id, String reason) {
        Voucher voucher = review(email, id);
        voucher.setStatus(REJECTED);
        voucher.setRejectionReason(reason.strip());
        return managed(voucher, Instant.now());
    }

    @Override
    @Transactional
    public void delete(String email, UUID id) {
        UserAccount user = manager(email);
        Voucher voucher = locked(id);
        requireEditable(user, voucher);
        voucher.markDeleted(Instant.now());
    }

    @Override
    public PaginatedResponse<AvailableVoucherResponse> available(String email, UUID stationId,
            UUID brandId, Pageable pageable) {
        UUID userId = actor(email, DomainValues.DRIVER).getId();
        Instant now = Instant.now();
        Specification<Voucher> spec = activeRows().and((root, query, cb) -> cb.and(
                cb.equal(root.get("status"), ACTIVE), cb.lessThanOrEqualTo(root.get("validFrom"), now),
                cb.greaterThanOrEqualTo(root.get("validTo"), now),
                cb.lt(root.get("claimedCount"), root.get("totalQuantity"))));
        if (stationId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("station").get("id"), stationId));
        if (brandId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("brand").get("id"), brandId));
        spec = spec.and((root, query, cb) -> cb.isNull(
                root.join("station", JoinType.LEFT).get("deletedAt")));
        Page<Voucher> page = vouchers.findAll(spec, ordered(pageable, "validTo"));
        Set<UUID> received = page.isEmpty() ? Set.of() : claims.claimedIds(userId, page.map(Voucher::getId).getContent());
        return PaginatedResponse.from(page.map(v -> new AvailableVoucherResponse(offer(v, now), received.contains(v.getId()))));
    }

    @Override
    @Transactional
    public UserVoucherResponse claim(String email, UUID voucherId) {
        UUID userId = actor(email, DomainValues.DRIVER).getId();
        Voucher voucher = locked(voucherId);
        Instant now = Instant.now();
        if (claims.existsByVoucherIdAndUserId(voucherId, userId)) {
            throw failure(ErrorCodes.VOUCHER_ALREADY_CLAIMED, HttpStatus.CONFLICT);
        }
        if (voucher.getStatus() != ACTIVE || now.isBefore(voucher.getValidFrom()) || now.isAfter(voucher.getValidTo())
                || voucher.getClaimedCount() >= voucher.getTotalQuantity()) {
            throw failure(ErrorCodes.VOUCHER_UNAVAILABLE, HttpStatus.CONFLICT);
        }
        if (voucher.getStation() != null && voucher.getStation().getDeletedAt() != null) {
            throw failure(ErrorCodes.VOUCHER_UNAVAILABLE, HttpStatus.CONFLICT);
        }
        UserVoucher claim = new UserVoucher();
        claim.setVoucher(voucher);
        claim.setUserId(userId);
        claim.setStatus(UserVoucherStatus.CLAIMED);
        claim.setClaimedAt(now.truncatedTo(ChronoUnit.MICROS));
        claim.setRedeemCode(voucher.getCodePrefix() + "-" + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 19).toUpperCase(Locale.ROOT));
        voucher.setClaimedCount(voucher.getClaimedCount() + 1);
        return walletItem(claims.saveAndFlush(claim), now);
    }

    @Override
    public PaginatedResponse<UserVoucherResponse> wallet(String email, UserVoucherStatus status, Pageable pageable) {
        UUID userId = actor(email, DomainValues.DRIVER).getId();
        Instant now = Instant.now();
        Specification<UserVoucher> spec = (root, query, cb) -> cb.equal(root.get("userId"), userId);
        if (status != null) spec = spec.and((root, query, cb) -> switch (status) {
            case USED -> cb.equal(root.get("status"), status);
            case CLAIMED -> cb.and(cb.equal(root.get("status"), status),
                    cb.greaterThanOrEqualTo(root.get("voucher").get("validTo"), now));
            case EXPIRED -> cb.or(cb.equal(root.get("status"), status),
                    cb.and(cb.equal(root.get("status"), UserVoucherStatus.CLAIMED),
                           cb.lessThan(root.get("voucher").get("validTo"), now)));
        });
        return PaginatedResponse.from(claims.findAll(spec, ordered(pageable, "claimedAt"))
                .map(item -> walletItem(item, now)));
    }

    @Override
    @Transactional
    public UserVoucherResponse downloadQr(String email, UUID id) {
        UUID userId = actor(email, DomainValues.DRIVER).getId();
        UserVoucher item = claims.lockOwned(id, userId).orElseThrow(VoucherServiceImpl::notFound);
        Instant now = Instant.now();
        if (item.getStatus() == UserVoucherStatus.CLAIMED) {
            if (now.isAfter(item.getVoucher().getValidTo())) {
                item.setStatus(UserVoucherStatus.EXPIRED);
            } else {
                item.setQrText(qrText(item));
                item.setUsedAt(now.truncatedTo(ChronoUnit.MICROS));
                item.setStatus(UserVoucherStatus.USED);
            }
        }
        return walletItem(item, now);
    }

    private void apply(Voucher voucher, UserAccount user, VoucherRequest request) {
        if (request.stationId() != null && request.brandId() != null) throw invalidDetails();
        Station station = admin(user)
                ? (request.stationId() == null ? null : station(request.stationId()))
                : verifyOperatorStation(user, request.stationId());
        Brand brand = request.brandId() == null ? null : brands.findById(request.brandId())
                .orElseThrow(VoucherServiceImpl::invalidDetails);
        BigDecimal minimum = Objects.requireNonNullElse(request.minOrderAmount(), BigDecimal.ZERO);
        Instant validFrom = request.validFrom().truncatedTo(ChronoUnit.MICROS);
        Instant validTo = request.validTo().truncatedTo(ChronoUnit.MICROS);
        if (!validTo.isAfter(validFrom) || request.totalQuantity() < voucher.getClaimedCount()
                || request.discountType() == VoucherDiscountType.PERCENT
                && request.discountValue().compareTo(BigDecimal.valueOf(100)) > 0) throw invalidDetails();
        if (voucher.getClaimedCount() > 0 && (!sameId(voucher.getStation(), station)
                || !sameId(voucher.getBrand(), brand) || !voucher.getCodePrefix().equalsIgnoreCase(request.codePrefix())
                || voucher.getDiscountType() != request.discountType()
                || voucher.getDiscountValue().compareTo(request.discountValue()) != 0
                || !sameAmount(voucher.getMaxDiscountAmount(), request.maxDiscountAmount())
                || voucher.getMinOrderAmount().compareTo(minimum) != 0
                || !voucher.getValidFrom().equals(validFrom) || !voucher.getValidTo().equals(validTo))) {
            throw failure(ErrorCodes.VOUCHER_TERMS_LOCKED, HttpStatus.CONFLICT);
        }
        voucher.setStation(station);
        voucher.setBrand(brand);
        voucher.setCodePrefix(request.codePrefix().toUpperCase(Locale.ROOT));
        voucher.setTitle(request.title().strip());
        voucher.setDescription(request.description());
        voucher.setDiscountType(request.discountType());
        voucher.setDiscountValue(request.discountValue());
        voucher.setMaxDiscountAmount(request.maxDiscountAmount());
        voucher.setMinOrderAmount(minimum);
        voucher.setTotalQuantity(request.totalQuantity());
        voucher.setValidFrom(validFrom);
        voucher.setValidTo(validTo);
    }

    private static boolean sameId(Station a, Station b) {
        return Objects.equals(a == null ? null : a.getId(), b == null ? null : b.getId());
    }

    private static boolean sameId(Brand a, Brand b) {
        return Objects.equals(a == null ? null : a.getId(), b == null ? null : b.getId());
    }

    private static boolean sameAmount(BigDecimal a, BigDecimal b) {
        return a == null || b == null ? a == b : a.compareTo(b) == 0;
    }

    private static void applyStatus(Voucher voucher, VoucherStatus target) {
        if ((target == ACTIVE || target == PENDING_APPROVAL) && Instant.now().isAfter(voucher.getValidTo())) {
            throw failure(ErrorCodes.VOUCHER_EXPIRED, HttpStatus.BAD_REQUEST);
        }
        voucher.setStatus(target);
    }

    private Voucher review(String email, UUID id) {
        UserAccount admin = actor(email, DomainValues.ADMIN);
        Voucher voucher = locked(id);
        if (voucher.getStatus() != PENDING_APPROVAL) throw invalidStatus();
        voucher.setReviewedBy(admin.getId());
        voucher.setReviewedAt(Instant.now());
        return voucher;
    }

    private Station verifyOperatorStation(UserAccount user, UUID id) {
        return verifyOperatorStation(user.getId(), id);
    }

    private Station verifyOperatorStation(UUID userId, UUID id) {
        if (id == null) throw invalidDetails();
        Station station = station(id);
        if (!userId.equals(station.getOperator().getId())) throw forbidden();
        return station;
    }

    private Station station(UUID id) {
        return stations.findByIdAndDeletedAtIsNull(id).orElseThrow(VoucherServiceImpl::invalidDetails);
    }

    private Voucher locked(UUID id) {
        return vouchers.lockActive(id).orElseThrow(VoucherServiceImpl::notFound);
    }

    private UserAccount manager(String email) {
        return actor(email, DomainValues.ADMIN, DomainValues.OPERATOR);
    }

    private UserAccount actor(String email, String... roles) {
        return users.findByLoginEmail(email).filter(u -> DomainValues.ACTIVE.equals(u.getStatus())
                && Set.of(roles).contains(u.getRole())).orElseThrow(VoucherServiceImpl::forbidden);
    }

    private static boolean admin(UserAccount user) {
        return DomainValues.ADMIN.equals(user.getRole());
    }

    private static void requireOwner(UserAccount user, Voucher voucher) {
        if (!admin(user) && !user.getId().equals(voucher.getCreatorId())) throw forbidden();
    }

    private static void requireEditable(UserAccount user, Voucher voucher) {
        requireOwner(user, voucher);
        if (!admin(user) && voucher.getStatus() != DRAFT && voucher.getStatus() != REJECTED) throw forbidden();
    }

    private static Specification<Voucher> activeRows() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    private static Specification<Voucher> campaignFilter(VoucherStatus status, Instant now) {
        return (root, query, cb) -> switch (status) {
            case EXPIRED -> cb.or(cb.equal(root.get("status"), EXPIRED),
                    cb.and(root.get("status").in(ACTIVE, INACTIVE), cb.lessThan(root.get("validTo"), now)));
            case ACTIVE, INACTIVE -> cb.and(cb.equal(root.get("status"), status),
                    cb.greaterThanOrEqualTo(root.get("validTo"), now));
            default -> cb.equal(root.get("status"), status);
        };
    }

    private static Pageable ordered(Pageable pageable, String property) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, property, "id"));
    }

    private static VoucherResponse managed(Voucher v, Instant now) {
        return new VoucherResponse(offer(v, now), v.getCreatorId(), v.getRejectionReason(), v.getReviewedBy(), v.getReviewedAt());
    }

    private static VoucherOfferResponse offer(Voucher v, Instant now) {
        Station station = v.getStation();
        Brand brand = v.getBrand();
        VoucherStatus status = (v.getStatus() == ACTIVE || v.getStatus() == INACTIVE) && now.isAfter(v.getValidTo())
                ? EXPIRED : v.getStatus();
        return new VoucherOfferResponse(v.getId(), v.getTitle(), v.getDescription(), v.getCodePrefix(),
                station == null ? null : station.getId(), station == null ? null : station.getName(),
                brand == null ? null : brand.getId(), brand == null ? null : brand.getName(),
                v.getDiscountType(), v.getDiscountValue(), v.getMaxDiscountAmount(), v.getMinOrderAmount(),
                v.getTotalQuantity(), v.getClaimedCount(), v.getValidFrom(), v.getValidTo(), status);
    }

    private static UserVoucherResponse walletItem(UserVoucher item, Instant now) {
        UserVoucherStatus status = item.getStatus();
        if (status == UserVoucherStatus.CLAIMED && now.isAfter(item.getVoucher().getValidTo())) status = UserVoucherStatus.EXPIRED;
        return new UserVoucherResponse(item.getId(), offer(item.getVoucher(), now), item.getRedeemCode(),
                status, item.getClaimedAt(), item.getUsedAt(), item.getQrText());
    }

    private static String qrText(UserVoucher item) {
        Voucher voucher = item.getVoucher();
        NumberFormat amount = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"));
        String discount = voucher.getDiscountType() == VoucherDiscountType.PERCENT
                ? amount.format(voucher.getDiscountValue()) + "%" : amount.format(voucher.getDiscountValue()) + "d";
        if (voucher.getMaxDiscountAmount() != null) discount += " (toi da " + amount.format(voucher.getMaxDiscountAmount()) + "d)";
        if (voucher.getMinOrderAmount().signum() > 0) discount += " (don toi thieu " + amount.format(voucher.getMinOrderAmount()) + "d)";
        String scope = voucher.getStation() != null ? voucher.getStation().getName()
                : voucher.getBrand() != null ? voucher.getBrand().getName() : "Toan he thong";
        return "MA VOUCHER: " + item.getRedeemCode() + "\nUU DAI: Giam " + discount
                + "\nAP DUNG: " + scope.replaceAll("[\\r\\n]+", " ")
                + "\nHAN THANH TOAN: " + QR_DATE.format(voucher.getValidTo());
    }

    private static CustomBusinessException forbidden() {
        return failure(ErrorCodes.VOUCHER_FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    private static CustomBusinessException invalidStatus() {
        return failure(ErrorCodes.VOUCHER_INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    private static CustomBusinessException invalidDetails() {
        return failure(ErrorCodes.VOUCHER_INVALID_DETAILS, HttpStatus.BAD_REQUEST);
    }

    private static CustomBusinessException notFound() {
        return failure(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    private static CustomBusinessException failure(String code, HttpStatus status) {
        return new CustomBusinessException(code, status);
    }
}
