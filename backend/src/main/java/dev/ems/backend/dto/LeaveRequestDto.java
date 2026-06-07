package dev.ems.backend.dto;

import dev.ems.backend.model.LeaveType;
import dev.ems.backend.model.RequestStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LeaveRequestDto {
    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private LeaveType leaveType;
    private RequestStatus status;
    private String reason;
    private UUID approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
