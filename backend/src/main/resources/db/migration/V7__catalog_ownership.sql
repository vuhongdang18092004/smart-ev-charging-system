ALTER TABLE brands ADD COLUMN created_by_user_id UUID REFERENCES users(id);
ALTER TABLE vehicles_infor ADD COLUMN created_by_user_id UUID REFERENCES users(id);
CREATE INDEX idx_brands_creator ON brands(created_by_user_id);
CREATE INDEX idx_vehicle_info_creator ON vehicles_infor(created_by_user_id);
CREATE UNIQUE INDEX uq_vehicle_info_active_model
    ON vehicles_infor (brand_id, lower(btrim(model))) WHERE deleted_at IS NULL;

ALTER TABLE operator_allowed_brands
    DROP CONSTRAINT operator_allowed_brands_brand_id_fkey,
    ADD CONSTRAINT operator_allowed_brands_brand_id_fkey
        FOREIGN KEY (brand_id) REFERENCES brands(id);
