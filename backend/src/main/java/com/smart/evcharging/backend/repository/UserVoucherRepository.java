package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.UserVoucher;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface UserVoucherRepository extends JpaRepository<UserVoucher, UUID>, JpaSpecificationExecutor<UserVoucher> {
    boolean existsByVoucherIdAndUserId(UUID voucherId, UUID userId);

    @Query("select v.voucher.id from UserVoucher v where v.userId = :userId and v.voucher.id in :ids")
    Set<UUID> claimedIds(UUID userId, Collection<UUID> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from UserVoucher v where v.id = :id and v.userId = :userId")
    Optional<UserVoucher> lockOwned(UUID id, UUID userId);
}
