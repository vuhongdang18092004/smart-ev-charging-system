ALTER TABLE stations
    ALTER COLUMN lat TYPE DOUBLE PRECISION,
    ALTER COLUMN lng TYPE DOUBLE PRECISION;

ALTER TABLE connectors
    ADD COLUMN code VARCHAR(50),
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'maintenance', 'out_of_service'));

-- Keep the original connector ID and expand the remaining ports in each legacy group.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_attribute
        WHERE attrelid = 'connectors'::regclass AND attname = 'quantity' AND NOT attisdropped
    ) THEN
        INSERT INTO connectors (station_id, connector_type_id, power_kw, price_per_kwh, created_at, updated_at)
        SELECT c.station_id, c.connector_type_id, c.power_kw, c.price_per_kwh, c.created_at, c.updated_at
        FROM connectors c
        CROSS JOIN LATERAL generate_series(2, c.quantity);
    END IF;
END $$;

WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY station_id ORDER BY created_at, id) AS port_number
    FROM connectors
)
UPDATE connectors c
SET code = '#' || numbered.port_number
FROM numbered
WHERE c.id = numbered.id;

ALTER TABLE connectors
    DROP COLUMN IF EXISTS quantity,
    ADD CONSTRAINT uq_connectors_station_code UNIQUE (station_id, code);
