package dev.ems.backend.dto;

import dev.ems.backend.model.LeaveType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DtoValidationTests {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testDepartmentDtoValidation() {
        DepartmentDto validDto = new DepartmentDto();
        validDto.setName("Engineering");
        validDto.setCode("ENG");
        
        Set<ConstraintViolation<DepartmentDto>> violations = validator.validate(validDto);
        assertTrue(violations.isEmpty());

        DepartmentDto invalidDto = new DepartmentDto();
        invalidDto.setName("");
        invalidDto.setCode("");

        violations = validator.validate(invalidDto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void testLeaveRequestDtoValidation() {
        LeaveRequestDto validDto = new LeaveRequestDto();
        validDto.setStartDate(LocalDate.now());
        validDto.setEndDate(LocalDate.now().plusDays(1));
        validDto.setLeaveType(LeaveType.CASUAL);
        validDto.setReason("Personal work");

        Set<ConstraintViolation<LeaveRequestDto>> violations = validator.validate(validDto);
        assertTrue(violations.isEmpty());

        LeaveRequestDto invalidDto = new LeaveRequestDto();
        // missing fields
        violations = validator.validate(invalidDto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void testPerformanceReviewDtoValidation() {
        PerformanceReviewDto validDto = new PerformanceReviewDto();
        validDto.setEmployeeId(UUID.randomUUID());
        validDto.setFeedback("Excellent performance overall!");
        validDto.setRating(5);

        Set<ConstraintViolation<PerformanceReviewDto>> violations = validator.validate(validDto);
        assertTrue(violations.isEmpty());

        PerformanceReviewDto invalidDto = new PerformanceReviewDto();
        invalidDto.setRating(6); // out of range [1, 5]
        invalidDto.setFeedback("short"); // less than 10 characters

        violations = validator.validate(invalidDto);
        assertFalse(violations.isEmpty());
    }
}
