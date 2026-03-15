package ecommerce.util;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;

@Component
public class OtpGenerator {

    private static final SecureRandom secureRandom = new SecureRandom();

    public String generate() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }
}