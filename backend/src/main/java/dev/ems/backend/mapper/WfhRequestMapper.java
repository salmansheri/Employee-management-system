package dev.ems.backend.mapper;

import dev.ems.backend.dto.WfhRequestDto;
import dev.ems.backend.model.WfhRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WfhRequestMapper {

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(wfhRequest.getEmployee().getFirstName() + \" \" + wfhRequest.getEmployee().getLastName())")
    @Mapping(source = "approvedBy.id", target = "approvedById")
    @Mapping(target = "approvedByName", expression = "java(wfhRequest.getApprovedBy() != null ? wfhRequest.getApprovedBy().getFirstName() + \" \" + wfhRequest.getApprovedBy().getLastName() : null)")
    WfhRequestDto toDto(WfhRequest wfhRequest);

    List<WfhRequestDto> toDtoList(List<WfhRequest> wfhRequests);
}
