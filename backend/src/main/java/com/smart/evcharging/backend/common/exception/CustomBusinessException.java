package com.smart.evcharging.backend.common.exception;

import org.springframework.http.HttpStatus;

public class CustomBusinessException extends RuntimeException {
    private final String code;
    private final HttpStatus status;

    public CustomBusinessException(String code, HttpStatus status) {
        super(code);
        this.code = code;
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
