package ecommerce.security;

import ecommerce.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiry.ms}")
    private long accessTokenExpiry;

    @Value("${jwt.refresh.expiry.ms}")
    private long refreshTokenExpiry;

    private final RedisTemplate<String, String> redisTemplate;

    // ── Manual constructor so @Qualifier works ─────────────
    public JwtService(@Qualifier("jwtRedisTemplate") RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // ── Generate access token ──────────────────────────────
    public String generateAccessToken(User user) {
        String jti = UUID.randomUUID().toString();

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("roles", user.getRoles().stream()
                .map(r -> r.getId().getRole().name())
                .collect(Collectors.toList()));

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .id(jti)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiry))
                .signWith(getSigningKey())
                .compact();
    }

    // ── Generate refresh token and store in Redis ──────────
    public String generateRefreshToken(User user) {
        String refreshToken = UUID.randomUUID().toString();
        String key = "refresh_token:" + user.getId();
        redisTemplate.opsForValue().set(key, refreshToken, refreshTokenExpiry, TimeUnit.MILLISECONDS);
        return refreshToken;
    }

    // ── Validate refresh token from Redis ─────────────────
    public boolean validateRefreshToken(Long userId, String token) {
        String key = "refresh_token:" + userId;
        Object stored = redisTemplate.opsForValue().get(key);
        return stored != null && stored.toString().equals(token);
    }

    // ── Blacklist access token on logout ──────────────────
    public void blacklistToken(String jti, long remainingMs) {
        redisTemplate.opsForValue().set(
                "blacklist:" + jti, "1", remainingMs, TimeUnit.MILLISECONDS);
    }

    // ── Check if token is blacklisted ─────────────────────
    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + jti));
    }

    // ── Delete refresh token on logout ────────────────────
    public void deleteRefreshToken(Long userId) {
        redisTemplate.delete("refresh_token:" + userId);
    }

    // ── Extract claims ────────────────────────────────────
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractJti(String token) {
        return parseClaims(token).getId();
    }

    public Date extractExpiration(String token) {
        return parseClaims(token).getExpiration();
    }

    public long getRemainingMs(String token) {
        return extractExpiration(token).getTime() - System.currentTimeMillis();
    }

    // ── Validate token ────────────────────────────────────
    public boolean isTokenValid(String token, String email) {
        try {
            String extractedEmail = extractEmail(token);
            String jti = extractJti(token);
            return extractedEmail.equals(email)
                    && !isTokenExpired(token)
                    && !isBlacklisted(jti);
        } catch (JwtException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}