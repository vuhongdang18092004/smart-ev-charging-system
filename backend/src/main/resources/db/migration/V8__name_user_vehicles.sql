ALTER TABLE user_vehicles ADD COLUMN name VARCHAR(100);

UPDATE user_vehicles AS vehicle
SET name = model.model
FROM vehicles_infor AS model
WHERE model.id = vehicle.vehicle_info_id;

ALTER TABLE user_vehicles ALTER COLUMN name SET NOT NULL;
