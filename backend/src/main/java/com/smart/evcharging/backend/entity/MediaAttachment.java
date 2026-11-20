package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseCreatedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class MediaAttachment extends BaseCreatedEntity {
    @Column(name = "media_type", nullable = false, length = 10)
    private String mediaType;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
