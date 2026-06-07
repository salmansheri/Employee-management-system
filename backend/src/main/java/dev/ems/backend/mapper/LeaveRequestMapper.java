package dev.ems.backend.mapper;

import dev.ems.backend.dto.LeaveRequestDto;
import dev.ems.backend.model.LeaveRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LeaveRequestMapper {

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(leaveRequest.getEmployee().getFirstName() + \" \" + leaveRequest.getEmployee().getLastName())")
    @Mapping(source = "approvedBy.id", target = "approvedById")
    @Mapping(target = "approvedByName", expression = "java(leaveRequest.getApprovedBy() != null ? leaveRequest.getApprovedBy().getFirstName() + \" \" + leaveRequest.getApprovedBy().getLastName() : null)")
    LeaveRequestDto toDto(LeaveRequest leaveRequest);

    List<LeaveRequestDto> toDtoList(List<LeaveRequest> leaveRequests);
}
