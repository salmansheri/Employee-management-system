package dev.ems.backend.controller;

import dev.ems.backend.dto.AttendanceDto;
import dev.ems.backend.mapper.AttendanceMapper;
import dev.ems.backend.model.Attendance;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.WorkLocation;
import dev.ems.backend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceMapper attendanceMapper;

    @GetMapping("/my")
    public ResponseEntity<List<AttendanceDto>> getMyAttendance(@AuthenticationPrincipal Employee currentEmployee) {
        List<Attendance> attendances = attendanceService.getAttendanceHistory(currentEmployee.getId());
        return ResponseEntity.ok(attendanceMapper.toDtoList(attendances));
    }

    @GetMapping("/status")
    public ResponseEntity<AttendanceDto> getPunchStatus(@AuthenticationPrincipal Employee currentEmployee) {
        return attendanceService.getTodayPunch(currentEmployee.getId())
                 .map(attendance -> ResponseEntity.ok(attendanceMapper.toDto(attendance)))
                 .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/punch-in")
    public ResponseEntity<AttendanceDto> punchIn(
            @RequestParam(required = false) WorkLocation location,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        Attendance attendance = attendanceService.punchIn(currentEmployee, location);
        return ResponseEntity.ok(attendanceMapper.toDto(attendance));
    }

    @PostMapping("/punch-out")
    public ResponseEntity<AttendanceDto> punchOut(@AuthenticationPrincipal Employee currentEmployee) {
        Attendance attendance = attendanceService.punchOut(currentEmployee);
        return ResponseEntity.ok(attendanceMapper.toDto(attendance));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #employeeId == principal.id")
    public ResponseEntity<List<AttendanceDto>> getEmployeeAttendance(
            @PathVariable UUID employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Attendance> attendances;
        if (startDate != null && endDate != null) {
            attendances = attendanceService.getAttendanceHistoryByRange(employeeId, startDate, endDate);
        } else {
            attendances = attendanceService.getAttendanceHistory(employeeId);
        }
        return ResponseEntity.ok(attendanceMapper.toDtoList(attendances));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AttendanceDto>> getAllAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<Attendance> attendances = attendanceService.getAllAttendanceByDate(date);
        return ResponseEntity.ok(attendanceMapper.toDtoList(attendances));
    }

    @GetMapping("/hours")
    public ResponseEntity<Double> getTotalHours(
            @RequestParam UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        if (!currentEmployee.getId().equals(employeeId) && 
            !currentEmployee.getRole().name().equals("ROLE_ADMIN") && 
            !currentEmployee.getRole().name().equals("ROLE_MANAGER")) {
            return ResponseEntity.status(403).build();
        }

        Double totalHours = attendanceService.getTotalHoursWorked(employeeId, startDate, endDate);
        return ResponseEntity.ok(totalHours);
    }
}
