package dev.ems.backend.controller;

import dev.ems.backend.dto.NotificationDto;
import dev.ems.backend.mapper.NotificationMapper;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.Notification;
import dev.ems.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationMapper notificationMapper;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getMyNotifications(@AuthenticationPrincipal Employee currentEmployee) {
        List<Notification> notifications = notificationService.getNotificationsForEmployee(currentEmployee.getId());
        return ResponseEntity.ok(notificationMapper.toDtoList(notifications));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getMyUnreadCount(@AuthenticationPrincipal Employee currentEmployee) {
        long count = notificationService.getUnreadCount(currentEmployee.getId());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, @AuthenticationPrincipal Employee currentEmployee) {
        notificationService.markAsRead(id, currentEmployee);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal Employee currentEmployee) {
        notificationService.markAllAsRead(currentEmployee.getId());
        return ResponseEntity.ok().build();
    }
}
