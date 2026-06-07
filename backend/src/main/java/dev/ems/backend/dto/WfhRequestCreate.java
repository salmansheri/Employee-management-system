package dev.ems.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class WfhRequestCreate {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String reason;
}
