package dev.ems.backend.messaging;

import dev.ems.backend.config.RabbitMQConfig;
import dev.ems.backend.dto.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void receiveNotification(NotificationMessage message) {
        log.info("Received message from RabbitMQ queue for recipient: {}", message.recipientEmail());

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(message.recipientEmail());
            email.setSubject("[EMS] " + message.title());
            
            String body = String.format("Hello %s,\n\n%s\n\nBest regards,\nEmployee Management System Team",
                    message.recipientName(), message.message());
            email.setText(body);
            
            // Set from email (must match configuration or be specified)
            email.setFrom("noreply@ems.dev");

            mailSender.send(email);
            log.info("Successfully sent email notification to {}", message.recipientEmail());
        } catch (Exception e) {
            log.error("Failed to send email notification to {}", message.recipientEmail(), e);
            // In a production environment, we could throw the exception to trigger RabbitMQ retries,
            // or route to a dead-letter queue (DLQ) if the error is non-transient.
            // For now, we catch and log to prevent infinite retry loops in local dev.
        }
    }
}
