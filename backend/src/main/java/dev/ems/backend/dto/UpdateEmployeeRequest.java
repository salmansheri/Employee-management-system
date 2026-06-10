package dev.ems.backend.dto;

import dev.ems.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateEmployeeRequest {

    @NotBlank
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 50)
    private String lastName;

    @NotBlank
    @Email
    private String email;

    @Size(min = 6, max = 40)
    private String password;

    private String phone;

    private String jobTitle;

    private String departmentCode;

    private UUID managerId;

    private BigDecimal salary;

    private LocalDate dateOfJoining;

    private Role role;
}
