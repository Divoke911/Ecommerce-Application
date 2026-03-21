package ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller_profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SellerProfile {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "bank_account")
    private String bankAccount;

    @Column(name = "ifsc_code")
    private String ifscCode;

    @Column(name = "seller_rating")
    private BigDecimal sellerRating = BigDecimal.ZERO;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Fix: return user ID safely
    public Long getUserId() {
        return user != null ? user.getId() : userId;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}