package ecommerce.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ── Registration verification OTP ─────────────────────
    @Async
    public void sendVerificationEmail(String toEmail, String otp) {
        String subject = "Verify your email — Flipkart";
        String body = """
                <h2>Welcome to Flipkart!</h2>
                <p>Your email verification OTP is:</p>
                <h1 style="color:#2874f0; letter-spacing:8px">%s</h1>
                <p>This OTP is valid for <b>10 minutes</b>.</p>
                <p>If you did not register, please ignore this email.</p>
                """.formatted(otp);
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Login OTP ─────────────────────────────────────────
    @Async
    public void sendLoginOtpEmail(String toEmail, String otp) {
        String subject = "Your login OTP — Flipkart";
        String body = """
                <h2>Login OTP</h2>
                <p>Your one-time login code is:</p>
                <h1 style="color:#2874f0; letter-spacing:8px">%s</h1>
                <p>This OTP is valid for <b>5 minutes</b>.</p>
                <p>If you did not attempt to login, please secure your account immediately.</p>
                """.formatted(otp);
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Password reset OTP ────────────────────────────────
    @Async
    public void sendPasswordResetEmail(String toEmail, String otp) {
        String subject = "Password reset OTP — Flipkart";
        String body = """
                <h2>Password Reset</h2>
                <p>Your password reset OTP is:</p>
                <h1 style="color:#2874f0; letter-spacing:8px">%s</h1>
                <p>This OTP is valid for <b>10 minutes</b>.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                """.formatted(otp);
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Generic HTML email sender ─────────────────────────
    private void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }
}