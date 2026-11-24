package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.BlogPost;
import com.smart.evcharging.backend.entity.BlogPostStatus;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface BlogPostRepository extends JpaRepository<BlogPost, UUID>, JpaSpecificationExecutor<BlogPost> {
    Optional<BlogPost> findByIdAndDeletedAtIsNull(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from BlogPost p where p.id = :id and p.deletedAt is null")
    Optional<BlogPost> lockActive(UUID id);

    Optional<BlogPost> findBySlugAndStatusAndDeletedAtIsNull(String slug, BlogPostStatus status);

    boolean existsBySlug(String slug);

    @Query(value = "select 1 from pg_advisory_xact_lock(190421, 9)", nativeQuery = true)
    int lockSlugAllocation();
}
