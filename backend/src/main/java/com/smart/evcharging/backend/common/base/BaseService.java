package com.smart.evcharging.backend.common.base;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BaseService<T, ID> {
    T findById(ID id);

    Page<T> findAll(Pageable pageable);

    void deleteById(ID id);
}
