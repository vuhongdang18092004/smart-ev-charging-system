package com.smart.evcharging.backend.service.impl;

import com.smart.evcharging.backend.dto.request.MediaRequest;
import com.smart.evcharging.backend.dto.response.MediaResponse;
import com.smart.evcharging.backend.entity.MediaAttachment;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

final class FeedbackMediaMapper {
    private FeedbackMediaMapper() {}

    static void apply(MediaAttachment attachment, MediaRequest request) {
        attachment.setMediaType(request.mediaType());
        attachment.setUrl(request.url());
        attachment.setThumbnailUrl(request.thumbnailUrl());
        attachment.setSortOrder(Objects.requireNonNullElse(request.sortOrder(), 0));
    }

    static List<MediaResponse> toResponses(List<? extends MediaAttachment> attachments) {
        return attachments.stream()
                .sorted(Comparator.comparingInt(MediaAttachment::getSortOrder).thenComparing(MediaAttachment::getId))
                .map(item -> new MediaResponse(item.getId(), item.getMediaType(), item.getUrl(),
                        item.getThumbnailUrl(), item.getSortOrder()))
                .toList();
    }
}
