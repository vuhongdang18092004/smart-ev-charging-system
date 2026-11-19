package com.smart.evcharging.backend.common.constants;

public final class DomainValues {
    public static final String BRAND_TYPES = "vehicle|station|both";
    public static final String CURRENT_TYPES = "AC|DC";
    public static final String STATION_STATUSES = "open|closed|temporarily_closed|maintenance";
    public static final String OPERATOR_ACCESS_TYPES = "open_to_all|closed|open_to_specific|unknown";
    public static final String STATION_ACCESS_TYPES = OPERATOR_ACCESS_TYPES + "|inherit";
    public static final String OPERATOR = "operator";
    public static final String ACTIVE = "active";
    public static final String DEFAULT_BRAND_TYPE = "both";
    public static final String DEFAULT_OPERATOR_ACCESS = "unknown";
    public static final String DEFAULT_STATION_ACCESS = "inherit";
    public static final String DEFAULT_STATION_STATUS = "open";
    public static final int BCRYPT_MAX_BYTES = 72;

    private DomainValues() {}
}
