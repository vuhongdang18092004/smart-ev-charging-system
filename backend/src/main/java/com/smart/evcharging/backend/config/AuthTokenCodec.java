package com.smart.evcharging.backend.config;

import com.smart.evcharging.backend.entity.UserAccount;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

@Component
@EnableConfigurationProperties(AuthProperties.class)
@ConditionalOnProperty(name="app.auth.enabled", havingValue="true")
public class AuthTokenCodec {
    private final AuthProperties properties;
    private final JwtEncoder encoder;
    private final JwtDecoder decoder;

    public AuthTokenCodec(AuthProperties properties) {
        this.properties = properties;
        SecretKey key = key(properties.jwtKey());
        if (java.security.MessageDigest.isEqual(key.getEncoded(), key(properties.otpKey()).getEncoded())) {
            throw new IllegalArgumentException("AUTH_JWT_KEY and AUTH_OTP_KEY must be distinct");
        }
        encoder = NimbusJwtEncoder.withSecretKey(key).algorithm(MacAlgorithm.HS256).build();
        NimbusJwtDecoder verifier = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        verifier.setJwtValidator(JwtValidators.createDefaultWithIssuer(properties.issuer()));
        decoder = verifier;
    }

    public String issue(UserAccount user, UUID family, String client, Instant now) {
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer(properties.issuer()).subject(user.getId().toString())
                .id(UUID.randomUUID().toString()).issuedAt(now).expiresAt(now.plus(properties.accessTtl()))
                .claim("sid", family.toString()).claim("role", user.getRole()).claim("client", client).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    public Jwt decode(String token) {
        return decoder.decode(token);
    }

    public static SecretKey key(String value) {
        byte[] bytes = Base64.getDecoder().decode(value);
        if (bytes.length < 32) {
            throw new IllegalArgumentException("Auth keys must contain at least 32 random bytes in Base64");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }
}
