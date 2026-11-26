CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id),
    station_id UUID REFERENCES stations(id),
    brand_id UUID REFERENCES brands(id),
    code_prefix VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED_AMOUNT')),
    discount_value DECIMAL(12,2) NOT NULL CHECK (discount_value > 0),
    max_discount_amount DECIMAL(12,2) CHECK (max_discount_amount >= 0),
    min_order_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
    total_quantity INT NOT NULL CHECK (total_quantity > 0),
    claimed_count INT NOT NULL DEFAULT 0 CHECK (claimed_count >= 0 AND claimed_count <= total_quantity),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'ACTIVE', 'EXPIRED', 'INACTIVE')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CHECK (valid_to > valid_from),
    CHECK (station_id IS NULL OR brand_id IS NULL),
    CHECK (discount_type <> 'PERCENT' OR discount_value <= 100)
);

CREATE TABLE user_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID NOT NULL REFERENCES vouchers(id),
    user_id UUID NOT NULL REFERENCES users(id),
    redeem_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'CLAIMED' CHECK (status IN ('CLAIMED', 'USED', 'EXPIRED')),
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    used_at TIMESTAMPTZ,
    qr_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_voucher_once UNIQUE (voucher_id, user_id)
);

CREATE INDEX idx_vouchers_status ON vouchers(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_vouchers_creator ON vouchers(creator_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vouchers_station ON vouchers(station_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_vouchers_user ON user_vouchers(user_id, status);
