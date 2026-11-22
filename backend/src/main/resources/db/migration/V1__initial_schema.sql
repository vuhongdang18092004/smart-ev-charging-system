-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
                       id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name           VARCHAR(100) NOT NULL,
                       email          VARCHAR(255) NOT NULL,
                       password_hash  VARCHAR(255) NOT NULL,
                       avatar_url     VARCHAR(500),
                       role           VARCHAR(20) NOT NULL CHECK (role IN ('admin','operator','driver')),
                       status         VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','banned','pending')),
                       created_at     TIMESTAMPTZ DEFAULT now(),
                       updated_at     TIMESTAMPTZ DEFAULT now(),
                       deleted_at     TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_users_email ON users(LOWER(email));
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

-- ============================================
-- BRANDS
-- ============================================
CREATE TABLE brands (
                        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name       VARCHAR(100) UNIQUE NOT NULL,
                        logo_url   VARCHAR(500),
                        website    VARCHAR(500),
                        type       VARCHAR(20) DEFAULT 'both' CHECK (type IN ('vehicle','station','both')),
                        created_at TIMESTAMPTZ DEFAULT now(),
                        updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_brands_type ON brands(type);

-- ============================================
-- CONNECTOR TYPES
-- ============================================
CREATE TABLE connector_types (
                                 id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 code          VARCHAR(20) UNIQUE NOT NULL,
                                 name          VARCHAR(100) NOT NULL,
                                 current_type  VARCHAR(5) NOT NULL CHECK (current_type IN ('AC','DC')),
                                 is_active     BOOLEAN DEFAULT true,
                                 sort_order    INT DEFAULT 0,
                                 created_at    TIMESTAMPTZ DEFAULT now(),
                                 updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_connector_types_active ON connector_types(is_active, sort_order);

-- ============================================
-- OPERATOR PROFILES
-- ============================================
CREATE TABLE operator_profiles (
                                   user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                   api_endpoint         VARCHAR(500),
                                   api_key_hash         VARCHAR(255),
                                   api_key_prefix       VARCHAR(16),
                                   api_key_last_used_at TIMESTAMPTZ,
                                   access_type          VARCHAR(20) NOT NULL DEFAULT 'unknown'
                                       CHECK (access_type IN ('open_to_all','closed','open_to_specific','unknown')),
                                   created_at           TIMESTAMPTZ DEFAULT now(),
                                   updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE operator_allowed_brands (
                                         operator_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                         brand_id    UUID REFERENCES brands(id) ON DELETE CASCADE,
                                         PRIMARY KEY (operator_id, brand_id)
);

-- ============================================
-- VEHICLE CATALOG AND USER VEHICLES
-- ============================================
CREATE TABLE vehicles_infor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id),
    model VARCHAR(100) NOT NULL,
    battery_kwh DECIMAL(8,2) NOT NULL CHECK (battery_kwh > 0),
    range_nedc_km INT NOT NULL CHECK (range_nedc_km >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_vehicles_infor_brand ON vehicles_infor(brand_id);

CREATE TABLE user_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_info_id UUID NOT NULL REFERENCES vehicles_infor(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_vehicles_user ON user_vehicles(user_id);
CREATE INDEX idx_user_vehicles_info ON user_vehicles(vehicle_info_id);

-- ============================================
-- STATIONS
-- ============================================
CREATE TABLE stations (
                          id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          operator_id     UUID NOT NULL REFERENCES users(id),
                          brand_id        UUID NOT NULL REFERENCES brands(id),
                          name            VARCHAR(200) NOT NULL,
                          address         VARCHAR(500) NOT NULL,
                          lat             DECIMAL(10,7) NOT NULL,
                          lng             DECIMAL(10,7) NOT NULL,
                          status          VARCHAR(20) DEFAULT 'open'
                              CHECK (status IN ('open','closed','temporarily_closed','maintenance')),
                          is_24_7         BOOLEAN DEFAULT false,
                          opening_time    TIME,
                          closing_time    TIME,
                          access_type     VARCHAR(20) NOT NULL DEFAULT 'inherit'
                              CHECK (access_type IN ('open_to_all','closed','open_to_specific','unknown','inherit')),
                          source_url      VARCHAR(500),
                          last_synced_at  TIMESTAMPTZ,
                          created_at      TIMESTAMPTZ DEFAULT now(),
                          updated_at      TIMESTAMPTZ DEFAULT now(),
                          deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_stations_operator ON stations(operator_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_stations_brand ON stations(brand_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_stations_status ON stations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_stations_lat_lng ON stations(lat, lng) WHERE deleted_at IS NULL;

-- ============================================
-- CONNECTORS
-- ============================================
CREATE TABLE connectors (
                            id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            station_id        UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
                            connector_type_id UUID NOT NULL REFERENCES connector_types(id),
                            power_kw          DECIMAL(6,2),
                            quantity          INT NOT NULL DEFAULT 1,
                            price_per_kwh     DECIMAL(10,2),
                            created_at        TIMESTAMPTZ DEFAULT now(),
                            updated_at        TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_connectors_station ON connectors(station_id);
CREATE INDEX idx_connectors_type ON connectors(connector_type_id);
CREATE INDEX idx_connectors_power ON connectors(power_kw) WHERE power_kw IS NOT NULL;

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE favorites (
                           driver_id  UUID REFERENCES users(id) ON DELETE CASCADE,
                           station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
                           created_at TIMESTAMPTZ DEFAULT now(),
                           PRIMARY KEY (driver_id, station_id)
);
CREATE INDEX idx_favorites_station ON favorites(station_id);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
                         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         driver_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                         station_id  UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
                         rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                         comment     TEXT,
                         created_at  TIMESTAMPTZ DEFAULT now(),
                         updated_at  TIMESTAMPTZ DEFAULT now(),
                         edit_count  SMALLINT DEFAULT 0,
                         UNIQUE (driver_id, station_id)
);
CREATE INDEX idx_reviews_station ON reviews(station_id);

-- ============================================
-- STATION REPORTS
-- ============================================
CREATE TABLE station_reports (
                                 id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 driver_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                 station_id        UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
                                 connector_type_id UUID REFERENCES connector_types(id),
                                 issue_type        VARCHAR(30) NOT NULL
                                     CHECK (issue_type IN ('broken','occupied_wrong','closed','wrong_info','other')),
                                 note              TEXT,
                                 status            VARCHAR(20) DEFAULT 'pending'
                                     CHECK (status IN ('pending','verified','rejected')),
                                 created_at        TIMESTAMPTZ DEFAULT now(),
                                 updated_at        TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_reports_station ON station_reports(station_id);
CREATE INDEX idx_reports_status ON station_reports(status);
CREATE INDEX idx_reports_driver ON station_reports(driver_id);
