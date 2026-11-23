ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN email_verified_at TIMESTAMPTZ;
CREATE UNIQUE INDEX uq_users_single_admin ON users(role) WHERE role = 'admin';

CREATE TABLE otp_verifications (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(24) NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
    otp_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    consumed_at TIMESTAMPTZ,
    PRIMARY KEY(user_id, purpose)
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    client VARCHAR(8) NOT NULL CHECK (client IN ('web', 'mobile')),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator', 'driver')),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    rotated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expires_at);
