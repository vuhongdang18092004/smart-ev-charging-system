package com.smart.evcharging.backend.common.validation;

import com.smart.evcharging.backend.common.constants.ErrorCodes;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = HttpMediaUrlValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE_USE})
@Retention(RetentionPolicy.RUNTIME)
public @interface HttpMediaUrl {
    String message() default "{" + ErrorCodes.INVALID_MEDIA_URL + "}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
