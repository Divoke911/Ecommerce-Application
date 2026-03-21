package ecommerce.service;

import ecommerce.exception.*;
import ecommerce.util.OtpGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class OtpService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final OtpGenerator otpGenerator;

    public OtpService(
            @Qualifier("objectRedisTemplate") RedisTemplate<String, Object> redisTemplate,
            OtpGenerator otpGenerator) {
        this.redisTemplate = redisTemplate;
        this.otpGenerator = otpGenerator;
    }

    private static final int MAX_ATTEMPTS      = 3;
    private static final int MAX_RESENDS        = 5;
    private static final long OTP_TTL_MINUTES   = 10L;
    private static final long RATE_TTL_HOURS    = 1L;
    private static final long LOCKOUT_TTL_MINS  = 15L;

    // ── Generate and store OTP in Redis ───────────────────
    public String generateAndStore(String email, String keyPrefix, long ttlMinutes) {

        // Check lockout
        if (Boolean.TRUE.equals(redisTemplate.hasKey("lockout:" + email))) {
            throw new TooManyAttemptsException(
                    "Account locked due to too many attempts. Try again after 15 minutes.");
        }

        // Rate limit resends
        String rateKey = "otp_rate:" + email;
        Object currentCount = redisTemplate.opsForValue().get(rateKey);
        int sendCount = toInt(currentCount);

        if (sendCount == 0) {
            redisTemplate.opsForValue().set(rateKey, 1, RATE_TTL_HOURS, TimeUnit.HOURS);
        } else if (sendCount >= MAX_RESENDS) {
            throw new TooManyAttemptsException(
                    "Too many OTP requests. Please try again after 1 hour.");
        } else {
            redisTemplate.opsForValue().increment(rateKey);
        }

        // Generate and store OTP
        String otp = otpGenerator.generate();
        Map<String, Object> data = new HashMap<>();
        data.put("otp", otp);
        data.put("attempts", 0);

        redisTemplate.opsForValue().set(
                keyPrefix + email, data, ttlMinutes, TimeUnit.MINUTES);

        log.info("OTP generated for prefix={} email={}", keyPrefix, email);
        return otp;
    }

    // ── Validate OTP ──────────────────────────────────────
    @SuppressWarnings("unchecked")
    public void validate(String email, String keyPrefix, String submittedOtp) {
        String key = keyPrefix + email;

        Object stored = redisTemplate.opsForValue().get(key);
        if (stored == null) {
            throw new OtpExpiredException(
                    "OTP has expired or was never generated. Please request a new one.");
        }

        Map<String, Object> data;
        try {
            data = (Map<String, Object>) stored;
        } catch (ClassCastException e) {
            log.error("Redis OTP data type mismatch for key={}", key);
            redisTemplate.delete(key);
            throw new OtpExpiredException(
                    "OTP session corrupted. Please request a new one.");
        }

        String savedOtp = String.valueOf(data.get("otp"));
        int attempts    = toInt(data.get("attempts")) + 1;

        if (!savedOtp.equals(submittedOtp)) {
            if (attempts >= MAX_ATTEMPTS) {
                // Lock account and delete OTP
                redisTemplate.delete(key);
                redisTemplate.opsForValue().set(
                        "lockout:" + email, "1",
                        LOCKOUT_TTL_MINS, TimeUnit.MINUTES);
                log.warn("Account locked due to too many OTP attempts: {}", email);
                throw new TooManyAttemptsException(
                        "Too many wrong attempts. Account locked for 15 minutes.");
            }

            // Update attempt count, preserve remaining TTL
            Long remainingTtl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            data.put("attempts", attempts);
            redisTemplate.opsForValue().set(
                    key, data,
                    remainingTtl != null ? remainingTtl : 300L,
                    TimeUnit.SECONDS);

            int remaining = MAX_ATTEMPTS - attempts;
            throw new InvalidOtpException(
                    "Wrong OTP. " + remaining + " attempt(s) remaining.");
        }

        // ✅ OTP correct — delete immediately (prevent replay)
        redisTemplate.delete(key);

        // Clear rate limit key on success
        redisTemplate.delete("otp_rate:" + email);

        log.info("OTP validated successfully for prefix={} email={}", keyPrefix, email);
    }

    // ── Safe int conversion from Redis value ──────────────
    private int toInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Integer i) return i;
        if (value instanceof Long l) return l.intValue();
        if (value instanceof Double d) return d.intValue();
        if (value instanceof String s) {
            try { return Integer.parseInt(s); }
            catch (NumberFormatException e) { return 0; }
        }
        return 0;
    }

    // ── Convenience wrappers ──────────────────────────────
    public String generateEmailVerificationOtp(String email) {
        return generateAndStore(email, "email_verify:", OTP_TTL_MINUTES);
    }

    public String generateLoginOtp(String email) {
        return generateAndStore(email, "login_otp:", 5L);
    }

    public String generatePasswordResetOtp(String email) {
        return generateAndStore(email, "pwd_reset:", OTP_TTL_MINUTES);
    }

    public void validateEmailVerificationOtp(String email, String otp) {
        validate(email, "email_verify:", otp);
    }

    public void validateLoginOtp(String email, String otp) {
        validate(email, "login_otp:", otp);
    }

    public void validatePasswordResetOtp(String email, String otp) {
        validate(email, "pwd_reset:", otp);
    }
}