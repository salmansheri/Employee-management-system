package dev.ems.backend.controller;

import dev.ems.backend.dto.LeaveRequestDto;
import dev.ems.backend.mapper.LeaveRequestMapper;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.LeaveRequest;
import dev.ems.backend.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final LeaveRequestMapper leaveRequestMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaveRequests() {
        List<LeaveRequest> requests = leaveRequestService.getAllLeaveRequests();
        return ResponseEntity.ok(leaveRequestMapper.toDtoList(requests));
    }

    @GetMapping("/my")
    public ResponseEntity<List<LeaveRequestDto>> getMyLeaveRequests(@AuthenticationPrincipal Employee currentEmployee) {
        List<LeaveRequest> requests = leaveRequestService.getLeaveRequestsByEmployee(currentEmployee.getId());
        return ResponseEntity.ok(leaveRequestMapper.toDtoList(requests));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #employeeId == principal.id")
    public ResponseEntity<List<LeaveRequestDto>> getLeaveRequestsByEmployee(@PathVariable UUID employeeId) {
        List<LeaveRequest> requests = leaveRequestService.getLeaveRequestsByEmployee(employeeId);
        return ResponseEntity.ok(leaveRequestMapper.toDtoList(requests));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<LeaveRequestDto>> getPendingRequestsForManager(@AuthenticationPrincipal Employee manager) {
        List<LeaveRequest> requests = leaveRequestService.getPendingRequestsForManager(manager.getId());
        return ResponseEntity.ok(leaveRequestMapper.toDtoList(requests));
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDto> applyForLeave(
            @RequestBody LeaveRequestDto dto,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        LeaveRequest request = leaveRequestService.applyForLeave(
                currentEmployee,
                dto.getStartDate(),
                dto.getEndDate(),
                dto.getLeaveType(),
                dto.getReason()
        );
        return ResponseEntity.ok(leaveRequestMapper.toDto(request));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDto> approveLeave(
            @PathVariable UUID id,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        LeaveRequest request = leaveRequestService.approveLeave(id, currentEmployee);
        return ResponseEntity.ok(leaveRequestMapper.toDto(request));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDto> rejectLeave(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        LeaveRequest request = leaveRequestService.rejectLeave(id, currentEmployee, reason);
        return ResponseEntity.ok(leaveRequestMapper.toDto(request));
    }
}
