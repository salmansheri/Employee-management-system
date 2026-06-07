package dev.ems.backend.dto;

import dev.ems.backend.model.EmployeeStatus;
import dev.ems.backend.model.Role;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class EmployeeDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String jobTitle;
    private UUID departmentId;
    private String departmentCode;
    private String departmentName;
    private BigDecimal salary;
    private LocalDate dateOfJoining;
    private EmployeeStatus status;
    private Role role;
    private UUID managerId;
    private String managerName;
    private String managerEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
