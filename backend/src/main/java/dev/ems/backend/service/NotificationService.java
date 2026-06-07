package dev.ems.backend.service;

import dev.ems.backend.config.RabbitMQConfig;
import dev.ems.backend.dto.NotificationMessage;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.Notification;
import dev.ems.backend.model.NotificationType;
import dev.ems.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public void sendNotification(Employee recipient, String title, String message, NotificationType type) {
        log.info("Creating notification of type {} for employee {}", type, recipient.getEmail());

        // 1. Save in-app notification to database
        Notification notification = Notification.builder()
                .employee(recipient)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // 2. Publish message to RabbitMQ for asynchronous processing (e.g. Email sending)
        NotificationMessage amqpMessage = new NotificationMessage(
                saved.getId(),
                recipient.getId(),
                recipient.getEmail(),
                recipient.getFirstName() + " " + recipient.getLastName(),
                title,
                message,
                type
        );

        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, amqpMessage);
            log.info("Successfully published notification message to RabbitMQ for notification ID {}", saved.getId());
        } catch (Exception e) {
            log.error("Failed to publish notification to RabbitMQ", e);
            // We do not fail the transaction if RabbitMQ publish fails, to ensure DB operations complete.
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForEmployee(UUID employeeId) {
        return notificationRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID employeeId) {
        return notificationRepository.countUnreadByEmployeeId(employeeId);
    }

    @Transactional
    public void markAsRead(UUID id, Employee employee) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + id));

        // Security check: Only the recipient employee can mark it as read
        if (!notification.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized: You cannot access this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID employeeId) {
        List<Notification> notifications = notificationRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        notifications.forEach(n -> {
            if (!n.isRead()) {
                n.setRead(true);
            }
        });
        notificationRepository.saveAll(notifications);
    }
}
