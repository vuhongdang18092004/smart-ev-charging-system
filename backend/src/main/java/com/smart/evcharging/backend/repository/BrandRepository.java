package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.Brand;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface BrandRepository extends JpaRepository<Brand, UUID> {
    List<Brand> findAllByOrderByNameAsc();
    boolean existsByNameAndIdNot(String name, UUID id);
}
