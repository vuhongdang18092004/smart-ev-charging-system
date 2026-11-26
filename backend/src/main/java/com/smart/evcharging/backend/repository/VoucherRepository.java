package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.Voucher;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface VoucherRepository extends JpaRepository<Voucher, UUID>, JpaSpecificationExecutor<Voucher> {
    Optional<Voucher> findByIdAndDeletedAtIsNull(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Voucher v where v.id = :id and v.deletedAt is null")
    Optional<Voucher> lockActive(UUID id);
}
