package com.smart.evcharging.backend.common.exception;

import com.smart.evcharging.backend.common.constants.ErrorCodes;
import com.smart.evcharging.backend.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {
    private final MessageSource messages;

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(Locale locale) {
        return response(HttpStatus.CONFLICT, ErrorCodes.CONFLICT, locale);
    }

    @ExceptionHandler(CustomBusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(CustomBusinessException exception, Locale locale) {
        return response(exception.getStatus(), exception.getCode(), locale);
    }

    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ApiResponse<Void>> handleValidation(Locale locale) {
        return response(HttpStatus.BAD_REQUEST, ErrorCodes.INVALID_REQUEST, locale);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception exception, Locale locale) {
        if (exception instanceof AuthenticationException || exception instanceof AccessDeniedException) {
            throw (RuntimeException) exception;
        }
        if (exception instanceof ErrorResponse error && error.getStatusCode().is4xxClientError()) {
            HttpStatusCode status = error.getStatusCode();
            String code = switch (status.value()) {
                case 400 -> ErrorCodes.INVALID_REQUEST;
                case 404 -> ErrorCodes.NOT_FOUND;
                default -> ErrorCodes.REQUEST_FAILED;
            };
            return new ResponseEntity<>(body(code, locale), error.getHeaders(), status);
        }
        log.error("Unhandled request exception", exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.INTERNAL_ERROR, locale);
    }

    private ResponseEntity<ApiResponse<Void>> response(HttpStatusCode status, String code, Locale locale) {
        return ResponseEntity.status(status).body(body(code, locale));
    }

    private ApiResponse<Void> body(String code, Locale locale) {
        String fallback = messages.getMessage(ErrorCodes.REQUEST_FAILED, null, locale);
        return ApiResponse.error(code, messages.getMessage(code, null, fallback, locale));
    }
}
