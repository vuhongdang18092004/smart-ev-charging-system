ALTER TABLE stations
    ADD COLUMN price_per_kwh DECIMAL(10,2) CHECK (price_per_kwh >= 0),
    ADD COLUMN phone VARCHAR(20);

LOCK TABLE connectors IN ACCESS EXCLUSIVE MODE;

-- A single station price cannot represent multiple different legacy prices.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM connectors GROUP BY station_id HAVING COUNT(DISTINCT price_per_kwh) > 1) THEN
        RAISE EXCEPTION 'Reconcile different connector prices within each station before running V5';
    END IF;
END $$;

UPDATE stations s
SET price_per_kwh = legacy.price
FROM (
    SELECT station_id, MIN(price_per_kwh) AS price
    FROM connectors WHERE price_per_kwh IS NOT NULL GROUP BY station_id
) legacy
WHERE legacy.station_id = s.id;

ALTER TABLE connectors DROP COLUMN price_per_kwh;

CREATE TABLE IF NOT EXISTS vehicles_infor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id),
    model VARCHAR(100) NOT NULL,
    battery_kwh DECIMAL(8,2) NOT NULL CHECK (battery_kwh > 0),
    range_nedc_km INT NOT NULL CHECK (range_nedc_km >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_vehicles_infor_brand ON vehicles_infor(brand_id);

CREATE TABLE IF NOT EXISTS user_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_info_id UUID NOT NULL REFERENCES vehicles_infor(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_vehicles_user ON user_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_info ON user_vehicles(vehicle_info_id);
