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

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ── Registration verification OTP ─────────────────────
    @Async
    public void sendVerificationEmail(String toEmail, String otp) {
        String subject = "Verify your email — Flipkart";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#2874f0">Welcome to Flipkart!</h2>
                  <p>Your email verification OTP is:</p>
                  <h1 style="color:#2874f0;letter-spacing:8px;text-align:center">%s</h1>
                  <p>This OTP is valid for <b>10 minutes</b>.</p>
                  <p style="color:#999">If you did not register, please ignore this email.</p>
                </div>
                """.formatted(otp);
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Login OTP ─────────────────────────────────────────
    @Async
    public void sendLoginOtpEmail(String toEmail, String otp) {
        String subject = "Your login OTP — Flipkart";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#2874f0">Login OTP</h2>
                  <p>Your one-time login code is:</p>
                  <h1 style="color:#2874f0;letter-spacing:8px;text-align:center">%s</h1>
                  <p>This OTP is valid for <b>5 minutes</b>.</p>
                  <p style="color:#999">If you did not attempt to login, please secure your account immediately.</p>
                </div>
                """.formatted(otp);
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Password reset OTP ────────────────────────────────
    @Async
    public void sendPasswordResetEmail(String toEmail, String otp) {
        String subject = "Password reset OTP — Flipkart";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#2874f0">Password Reset</h2>
                  <p>Your password reset OTP is:</p>
                  <h1 style="color:#2874f0;letter-spacing:8px;text-align:center">%s</h1>
                  <p>This OTP is valid for <b>10 minutes</b>.</p>
                  <p style="color:#999">If you did not request a password reset, please ignore this email.</p>
                </div>
                """.formatted(otp);
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Order placed confirmation ──────────────────────────
    @Async
    public void sendOrderConfirmationEmail(String toEmail,
                                            Long orderId,
                                            BigDecimal finalAmount) {
        String subject = "Order Confirmed #" + orderId + " — Flipkart";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#2874f0">Order Confirmed!</h2>
                  <p>Thank you for your order. Here are your order details:</p>
                  <table style="width:100%;border-collapse:collapse">
                    <tr>
                      <td style="padding:8px;border:1px solid #ddd"><b>Order ID</b></td>
                      <td style="padding:8px;border:1px solid #ddd">#%d</td>
                    </tr>
                    <tr>
                      <td style="padding:8px;border:1px solid #ddd"><b>Amount Paid</b></td>
                      <td style="padding:8px;border:1px solid #ddd">₹%s</td>
                    </tr>
                    <tr>
                      <td style="padding:8px;border:1px solid #ddd"><b>Estimated Delivery</b></td>
                      <td style="padding:8px;border:1px solid #ddd">5-7 business days</td>
                    </tr>
                  </table>
                  <p style="margin-top:20px">We will notify you when your order is shipped.</p>
                  <p style="color:#999">Thank you for shopping with Flipkart!</p>
                </div>
                """.formatted(orderId, finalAmount.toPlainString());
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Order status update ────────────────────────────────
    @Async
    public void sendOrderStatusEmail(String toEmail,
                                      Long orderId,
                                      String status) {
        String subject = "Order #" + orderId + " Update — Flipkart";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#2874f0">Order Status Update</h2>
                  <p>Your order <b>#%d</b> status has been updated to:</p>
                  <h3 style="color:#2874f0;text-align:center">%s</h3>
                  <p>Login to your account to view order details.</p>
                  <p style="color:#999">Thank you for shopping with Flipkart!</p>
                </div>
                """.formatted(orderId, status);
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Order cancelled ───────────────────────────────────
    @Async
    public void sendOrderCancelledEmail(String toEmail, Long orderId) {
        String subject = "Order #" + orderId + " Cancelled — Flipkart";
        String body = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                  <h2 style="color:#e74c3c">Order Cancelled</h2>
                  <p>Your order <b>#%d</b> has been cancelled.</p>
                  <p>If you paid online, your refund will be processed within 5-7 business days.</p>
                  <p style="color:#999">Thank you for shopping with Flipkart!</p>
                </div>
                """.formatted(orderId);
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Generic HTML email sender ─────────────────────────
    private void sendHtmlEmail(String toEmail,
                                String subject,
                                String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}",
                    toEmail, e.getMessage());
        }
    }
}