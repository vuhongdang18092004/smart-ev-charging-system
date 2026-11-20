DROP TABLE IF EXISTS user_vehicles CASCADE;

ALTER TABLE stations
    ADD COLUMN location_type VARCHAR(20) NOT NULL DEFAULT 'public'
        CHECK (location_type IN ('public', 'private')),
    ADD COLUMN parking_fee_type VARCHAR(20) NOT NULL DEFAULT 'unknown'
        CHECK (parking_fee_type IN ('free', 'paid', 'unknown')),
    ADD COLUMN avg_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN rating_count INT NOT NULL DEFAULT 0;

UPDATE stations s
SET avg_rating = scores.avg_rating, rating_count = scores.rating_count
FROM (
    SELECT station_id, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS rating_count
    FROM reviews
    GROUP BY station_id
) scores
WHERE scores.station_id = s.id;

CREATE TABLE station_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_station_images_station ON station_images(station_id);

CREATE TABLE review_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_review_media_review ON review_media(review_id);

CREATE TABLE station_report_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES station_reports(id) ON DELETE CASCADE,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_station_report_media_report ON station_report_media(report_id);
