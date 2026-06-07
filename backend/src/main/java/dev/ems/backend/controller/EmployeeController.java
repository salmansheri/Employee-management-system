package dev.ems.backend.controller;

import dev.ems.backend.dto.EmployeeDto;
import dev.ems.backend.dto.RegisterRequest;
import dev.ems.backend.mapper.EmployeeMapper;
import dev.ems.backend.model.Employee;
import dev.ems.backend.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeMapper employeeMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<EmployeeDto>> getAllEmployees() {
        List<Employee> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employeeMapper.toDtoList(employees));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #id == principal.id")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable UUID id) {
        Employee employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    public ResponseEntity<EmployeeDto> updateEmployee(
            @PathVariable UUID id,
            @Valid @RequestBody RegisterRequest request,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        // Prevent non-admins from upgrading their own role or salary
        if (!currentEmployee.getRole().name().equals("ROLE_ADMIN")) {
            request.setRole(null);
            request.setSalary(null);
            request.setDepartmentCode(null);
            request.setManagerId(null);
        }

        Employee employee = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable UUID id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
