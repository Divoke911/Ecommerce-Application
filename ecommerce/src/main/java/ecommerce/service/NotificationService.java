package ecommerce.service;

import ecommerce.dto.response.NotificationResponse;
import ecommerce.entity.*;
import ecommerce.enums.NotificationType;
import ecommerce.exception.ResourceNotFoundException;
import ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;

    public Page<NotificationResponse> getMyNotifications(
            int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return notificationRepository
                .findAllByUserId(user.getId(), pageable)
                .map(this::toResponse);
    }

    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository
                .countByUserIdAndIsReadFalse(user.getId());
    }

    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found: " + id));
        notification.setIsRead(true);
        notificationRepository.save(notification);
        log.info("Notification marked as read: id={}", id);
    }

    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        notificationRepository.markAllAsReadByUserId(user.getId());
        log.info("All notifications marked as read: userId={}",
                user.getId());
    }

    public void createNotification(User user, NotificationType type,
                                    String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
        log.info("Notification created: userId={} type={}",
                user.getId(), type);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}