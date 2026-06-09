package dev.ems.backend.controller;

import dev.ems.backend.dto.LoginRequest;
import dev.ems.backend.dto.LoginResponse;
import dev.ems.backend.dto.RegisterRequest;
import dev.ems.backend.dto.EmployeeDto;
import dev.ems.backend.dto.ChangePasswordRequest;
import dev.ems.backend.mapper.EmployeeMapper;
import dev.ems.backend.model.Employee;
import dev.ems.backend.security.JwtUtils;
import dev.ems.backend.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final EmployeeService employeeService;
    private final JwtUtils jwtUtils;
    private final EmployeeMapper employeeMapper;

    @PostMapping("/register")
    public ResponseEntity<EmployeeDto> register(@Valid @RequestBody RegisterRequest request) {
        Employee employee = employeeService.registerEmployee(request);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        Employee employee = (Employee) authentication.getPrincipal();

        String accessToken = jwtUtils.generateAccessToken(employee.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(employee.getEmail());

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(7 * 24 * 3600)
                .sameSite("Strict")
                .build();

        LoginResponse response = new LoginResponse(
                accessToken,
                "Bearer",
                employee.getEmail(),
                employee.getRole(),
                employee.getId()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || !jwtUtils.validateJwtToken(refreshToken)) {
            return ResponseEntity.status(401).body("Invalid or missing refresh token");
        }

        String username = jwtUtils.getUsernameFromJwtToken(refreshToken);
        Employee employee = employeeService.getEmployeeByEmail(username);

        String newAccessToken = jwtUtils.generateAccessToken(employee.getEmail());

        LoginResponse response = new LoginResponse(
                newAccessToken,
                "Bearer",
                employee.getEmail(),
                employee.getRole(),
                employee.getId()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logged out successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeDto> getMe(@AuthenticationPrincipal Employee currentEmployee) {
        if (currentEmployee == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(employeeMapper.toDto(currentEmployee));
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request, @AuthenticationPrincipal Employee currentEmployee) {
        if (currentEmployee == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            employeeService.changePassword(currentEmployee.getEmail(), request);
            return ResponseEntity.ok("Password changed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
