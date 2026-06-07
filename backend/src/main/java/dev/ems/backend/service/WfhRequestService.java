package dev.ems.backend.service;

import dev.ems.backend.model.Employee;
import dev.ems.backend.model.RequestStatus;
import dev.ems.backend.model.WfhRequest;
import dev.ems.backend.model.NotificationType;
import dev.ems.backend.repository.EmployeeRepository;
import dev.ems.backend.repository.WfhRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WfhRequestService {

    private final WfhRequestRepository wfhRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<WfhRequest> getAllWfhRequests() {
        return wfhRequestRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public WfhRequest getWfhRequestById(UUID id) {
        return wfhRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("WFH request not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<WfhRequest> getWfhRequestsByEmployee(UUID employeeId) {
        return wfhRequestRepository.findByEmployeeId(employeeId);
    }

    @Transactional(readOnly = true)
    public List<WfhRequest> getPendingRequestsForManager(UUID managerId) {
        return wfhRequestRepository.findByManagerAndStatus(managerId, RequestStatus.PENDING);
    }

    @Transactional
    public WfhRequest applyForWfh(Employee employee, LocalDate startDate, LocalDate endDate, String reason) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // Validate overlapping WFH requests
        List<WfhRequest> overlapping = wfhRequestRepository.findOverlappingWfhRequests(employee.getId(), startDate, endDate);
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("WFH request dates overlap with an existing approved or pending request");
        }

        WfhRequest wfhRequest = WfhRequest.builder()
                .employee(employee)
                .startDate(startDate)
                .endDate(endDate)
                .status(RequestStatus.PENDING)
                .reason(reason)
                .build();

        WfhRequest saved = wfhRequestRepository.save(wfhRequest);
        if (employee.getManager() != null) {
            String title = "New WFH Request from " + employee.getFirstName() + " " + employee.getLastName();
            String message = String.format("%s %s has applied for Work From Home from %s to %s. Reason: %s",
                    employee.getFirstName(), employee.getLastName(), startDate, endDate, reason);
            notificationService.sendNotification(employee.getManager(), title, message, NotificationType.WFH_APPLIED);
        }
        return saved;
    }

    @Transactional
    public WfhRequest approveWfh(UUID id, Employee manager) {
        WfhRequest request = getWfhRequestById(id);

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("WFH request is already processed: " + request.getStatus());
        }

        // Validate manager linkage or admin
        if (!manager.getId().equals(request.getEmployee().getManager().getId()) && !manager.getRole().name().equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Unauthorized: Only direct manager or admin can approve WFH requests");
        }

        request.setStatus(RequestStatus.APPROVED);
        request.setApprovedBy(manager);
        request.setApprovedAt(LocalDateTime.now());

        WfhRequest saved = wfhRequestRepository.save(request);
        String title = "WFH Request Approved";
        String message = String.format("Your WFH request from %s to %s has been approved by %s %s.",
                saved.getStartDate(), saved.getEndDate(), manager.getFirstName(), manager.getLastName());
        notificationService.sendNotification(saved.getEmployee(), title, message, NotificationType.WFH_APPROVED);
        return saved;
    }

    @Transactional
    public WfhRequest rejectWfh(UUID id, Employee manager, String reason) {
        WfhRequest request = getWfhRequestById(id);

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("WFH request is already processed: " + request.getStatus());
        }

        // Validate manager linkage or admin
        if (!manager.getId().equals(request.getEmployee().getManager().getId()) && !manager.getRole().name().equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Unauthorized: Only direct manager or admin can reject WFH requests");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setApprovedBy(manager);
        request.setApprovedAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            request.setReason(request.getReason() + " | Rejection Reason: " + reason);
        }

        WfhRequest saved = wfhRequestRepository.save(request);
        String title = "WFH Request Rejected";
        String message = String.format("Your WFH request from %s to %s has been rejected by %s %s. Reason: %s",
                saved.getStartDate(), saved.getEndDate(), manager.getFirstName(), manager.getLastName(), reason != null ? reason : "No specific reason provided");
        notificationService.sendNotification(saved.getEmployee(), title, message, NotificationType.WFH_REJECTED);
        return saved;
    }
}
