package com.smart.evcharging.backend.repository;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class AuthSessionRepository {
    private final JdbcClient jdbc;

    public record Otp(String otpHash, OffsetDateTime expiresAt, OffsetDateTime createdAt, int attemptCount, OffsetDateTime consumedAt) {}
    public record Refresh(UUID id, UUID userId, UUID familyId, String client, String role,
            OffsetDateTime expiresAt, OffsetDateTime revokedAt, boolean rotated) {}

    public void lockEmail(String email) {
        jdbc.sql("select pg_advisory_xact_lock(hashtextextended(?, 0))")
                .param(email).query((result, row) -> Boolean.TRUE).single();
    }

    private static OffsetDateTime utc(Instant timestamp) {
        return timestamp.atOffset(ZoneOffset.UTC);
    }

    public Optional<Otp> otp(UUID user, String purpose) {
        return jdbc.sql("select otp_hash, expires_at, created_at, attempt_count, consumed_at from otp_verifications where user_id=? and purpose=?")
                .params(user, purpose).query(Otp.class).optional();
    }

    public void putOtp(UUID user, String purpose, String hash, Instant expires, Instant now) {
        jdbc.sql("""
                insert into otp_verifications(user_id,purpose,otp_hash,expires_at,created_at) values (?,?,?,?,?)
                on conflict (user_id,purpose) do update set otp_hash=excluded.otp_hash, expires_at=excluded.expires_at,
                    created_at=excluded.created_at, attempt_count=0, consumed_at=null
                """).params(user,purpose,hash,utc(expires),utc(now)).update();
    }

    public void failOtp(UUID user, String purpose) {
        jdbc.sql("update otp_verifications set attempt_count=attempt_count+1 where user_id=? and purpose=?")
                .params(user,purpose).update();
    }

    public void consumeOtp(UUID user, String purpose, Instant now) {
        jdbc.sql("update otp_verifications set consumed_at=? where user_id=? and purpose=?")
                .params(utc(now),user,purpose).update();
    }

    public Optional<Refresh> refresh(String hash) {
        return jdbc.sql("select id,user_id,family_id,client,role,expires_at,revoked_at,rotated from refresh_tokens where token_hash=?")
                .param(hash).query(Refresh.class).optional();
    }

    public void addRefresh(UUID id, UUID user, UUID family, String hash, String client, String role, Instant expires) {
        jdbc.sql("insert into refresh_tokens(id,user_id,family_id,token_hash,client,role,expires_at) values (?,?,?,?,?,?,?)")
                .params(id,user,family,hash,client,role,utc(expires)).update();
    }

    public void rotate(UUID id, Instant now) {
        jdbc.sql("update refresh_tokens set revoked_at=?, rotated=true where id=?").params(utc(now),id).update();
    }

    public void revokeFamily(UUID family, Instant now) {
        jdbc.sql("update refresh_tokens set revoked_at=? where family_id=? and revoked_at is null").params(utc(now),family).update();
    }

    public void revokeUser(UUID user, Instant now) {
        jdbc.sql("update refresh_tokens set revoked_at=? where user_id=? and revoked_at is null").params(utc(now),user).update();
    }

    public boolean active(UUID user, UUID family, String client, Instant now) {
        return jdbc.sql("select exists(select 1 from refresh_tokens where user_id=? and family_id=? and client=? and revoked_at is null and expires_at>?)")
                .params(user,family,client,utc(now)).query(Boolean.class).single();
    }
}
