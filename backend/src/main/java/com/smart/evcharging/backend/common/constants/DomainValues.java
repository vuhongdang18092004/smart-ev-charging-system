package com.smart.evcharging.backend.common.constants;

public final class DomainValues {
    public static final String BRAND_TYPES = "vehicle|station|both";
    public static final String CURRENT_TYPES = "AC|DC";
    public static final String STATION_STATUSES = "open|closed|temporarily_closed|maintenance";
    public static final String OPERATOR_ACCESS_TYPES = "open_to_all|closed|open_to_specific|unknown";
    public static final String STATION_ACCESS_TYPES = OPERATOR_ACCESS_TYPES + "|inherit";
    public static final String ADMIN = "admin";
    public static final String OPERATOR = "operator";
    public static final String ADMIN_AUTHORITY = "ADMIN";
    public static final String DRIVER_AUTHORITY = "DRIVER";
    public static final String DEFAULT_CONNECTOR_STATUS = "available";
    public static final String CONNECTOR_STATUSES = DEFAULT_CONNECTOR_STATUS + "|occupied|maintenance|out_of_service";
    public static final int MAX_CONNECTOR_QUANTITY = 50;
    public static final int CONNECTOR_CODE_LENGTH = 50;
    public static final int CONNECTOR_PREFIX_LENGTH = 39;
    public static final String DRIVER = "driver";
    public static final String PUBLIC_LOCATION = "public";
    public static final String UNKNOWN_PARKING_FEE = "unknown";
    public static final String LOCATION_TYPES = PUBLIC_LOCATION + "|private";
    public static final String PARKING_FEE_TYPES = "free|paid|" + UNKNOWN_PARKING_FEE;
    public static final String MEDIA_TYPES = "image|video";
    public static final String REPORT_ISSUE_TYPES = "broken|occupied_wrong|closed|wrong_info|other";
    public static final String DEFAULT_REPORT_STATUS = "pending";
    public static final int MIN_RATING = 1;
    public static final int MAX_RATING = 5;
    public static final String ACTIVE = "active";
    public static final String USER_STATUSES = ACTIVE + "|banned|pending";
    public static final int PASSWORD_MIN_LENGTH = 8;
    public static final String DEFAULT_BRAND_TYPE = "both";
    public static final String DEFAULT_OPERATOR_ACCESS = "unknown";
    public static final String DEFAULT_STATION_ACCESS = "inherit";
    public static final String DEFAULT_STATION_STATUS = "open";
    public static final int BCRYPT_MAX_BYTES = 72;

    private DomainValues() {}
}
