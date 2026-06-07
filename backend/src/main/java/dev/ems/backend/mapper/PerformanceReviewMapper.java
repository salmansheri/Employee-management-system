package dev.ems.backend.mapper;

import dev.ems.backend.dto.PerformanceReviewDto;
import dev.ems.backend.model.PerformanceReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PerformanceReviewMapper {

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(performanceReview.getEmployee().getFirstName() + \" \" + performanceReview.getEmployee().getLastName())")
    @Mapping(source = "reviewer.id", target = "reviewerId")
    @Mapping(target = "reviewerName", expression = "java(performanceReview.getReviewer().getFirstName() + \" \" + performanceReview.getReviewer().getLastName())")
    PerformanceReviewDto toDto(PerformanceReview performanceReview);

    List<PerformanceReviewDto> toDtoList(List<PerformanceReview> performanceReviews);
}
