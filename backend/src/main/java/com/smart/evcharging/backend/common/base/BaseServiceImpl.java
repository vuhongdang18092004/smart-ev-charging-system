package com.smart.evcharging.backend.common.base;

import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@Transactional(readOnly = true)
public abstract class BaseServiceImpl<T extends BaseEntity, ID> implements BaseService<T, ID> {
    private final JpaSpecificationExecutor<T> repository;

    protected BaseServiceImpl(JpaSpecificationExecutor<T> repository) {
        this.repository = repository;
    }

    @Override
    public T findById(ID id) {
        return repository.findOne(active().and((root, query, criteria) -> criteria.equal(root.get("id"), id)))
                .orElseThrow(() -> new CustomBusinessException(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND));
    }

    @Override
    public Page<T> findAll(Pageable pageable) {
        return repository.findAll(active(), pageable);
    }

    @Override
    @Transactional
    public void deleteById(ID id) {
        findById(id).markDeleted(Instant.now());
    }

    protected Specification<T> active() {
        return (root, query, criteria) -> criteria.isNull(root.get("deletedAt"));
    }
}
