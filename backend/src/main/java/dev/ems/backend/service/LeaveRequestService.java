package dev.ems.backend.service;

import dev.ems.backend.model.Employee;
import dev.ems.backend.model.LeaveRequest;
import dev.ems.backend.model.LeaveType;
import dev.ems.backend.model.RequestStatus;
import dev.ems.backend.model.NotificationType;
import dev.ems.backend.repository.EmployeeRepository;
import dev.ems.backend.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public LeaveRequest getLeaveRequestById(UUID id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<LeaveRequest> getLeaveRequestsByEmployee(UUID employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequest> getPendingRequestsForManager(UUID managerId) {
        return leaveRequestRepository.findByManagerAndStatus(managerId, RequestStatus.PENDING);
    }

    @Transactional
    public LeaveRequest applyForLeave(Employee employee, LocalDate startDate, LocalDate endDate, LeaveType leaveType, String reason) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // Validate overlapping leave requests
        List<LeaveRequest> overlapping = leaveRequestRepository.findOverlappingLeaves(employee.getId(), startDate, endDate);
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Leave request dates overlap with an existing approved or pending request");
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .startDate(startDate)
                .endDate(endDate)
                .leaveType(leaveType)
                .status(RequestStatus.PENDING)
                .reason(reason)
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        if (employee.getManager() != null) {
            String title = "New Leave Request from " + employee.getFirstName() + " " + employee.getLastName();
            String message = String.format("%s %s has applied for %s leave from %s to %s. Reason: %s",
                    employee.getFirstName(), employee.getLastName(), leaveType, startDate, endDate, reason);
            notificationService.sendNotification(employee.getManager(), title, message, NotificationType.LEAVE_APPLIED);
        }
        return saved;
    }

    @Transactional
    public LeaveRequest approveLeave(UUID id, Employee manager) {
        LeaveRequest request = getLeaveRequestById(id);
        
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("Leave request is already processed: " + request.getStatus());
        }

        // Validate that manager is indeed the manager of the requester (or has Role.ROLE_ADMIN)
        if (!manager.getId().equals(request.getEmployee().getManager().getId()) && !manager.getRole().name().equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Unauthorized: Only direct manager or admin can approve leave requests");
        }

        request.setStatus(RequestStatus.APPROVED);
        request.setApprovedBy(manager);
        request.setApprovedAt(LocalDateTime.now());

        LeaveRequest saved = leaveRequestRepository.save(request);
        String title = "Leave Request Approved";
        String message = String.format("Your leave request from %s to %s has been approved by %s %s.",
                saved.getStartDate(), saved.getEndDate(), manager.getFirstName(), manager.getLastName());
        notificationService.sendNotification(saved.getEmployee(), title, message, NotificationType.LEAVE_APPROVED);
        return saved;
    }

    @Transactional
    public LeaveRequest rejectLeave(UUID id, Employee manager, String reason) {
        LeaveRequest request = getLeaveRequestById(id);

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("Leave request is already processed: " + request.getStatus());
        }

        // Validate manager role/linkage
        if (!manager.getId().equals(request.getEmployee().getManager().getId()) && !manager.getRole().name().equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Unauthorized: Only direct manager or admin can reject leave requests");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setApprovedBy(manager);
        request.setApprovedAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            request.setReason(request.getReason() + " | Rejection Reason: " + reason);
        }

        LeaveRequest saved = leaveRequestRepository.save(request);
        String title = "Leave Request Rejected";
        String message = String.format("Your leave request from %s to %s has been rejected by %s %s. Reason: %s",
                saved.getStartDate(), saved.getEndDate(), manager.getFirstName(), manager.getLastName(), reason != null ? reason : "No specific reason provided");
        notificationService.sendNotification(saved.getEmployee(), title, message, NotificationType.LEAVE_REJECTED);
        return saved;
    }
}
