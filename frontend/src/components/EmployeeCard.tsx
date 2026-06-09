import { Mail, Phone, Shield, Edit, Trash2, Building2, Briefcase } from 'lucide-react';
import type { EmployeeDto } from '../client/types.gen';

interface EmployeeCardProps {
  emp: EmployeeDto;
  me: EmployeeDto | null | undefined;
  hasEditPrivilege: boolean;
  onViewDetails: (emp: EmployeeDto) => void;
  onEditClick: (emp: EmployeeDto) => void;
  onDeleteClick: (id: string) => void;
}

export function EmployeeCard({
  emp,
  me,
  hasEditPrivilege,
  onViewDetails,
  onEditClick,
  onDeleteClick,
}: EmployeeCardProps) {
  return (
    <div className="glass-panel hover:border-mauve/30 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between group transition-all">
      {/* Profile Card Header */}
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-surface0 to-surface1 border border-surface2/30 flex items-center justify-center font-bold text-base text-mauve">
              {emp.firstName?.charAt(0)}
              {emp.lastName?.charAt(0)}
            </div>
            <div>
              <h4
                className="font-bold text-text text-sm hover:underline cursor-pointer"
                onClick={() => onViewDetails(emp)}
              >
                {emp.firstName} {emp.lastName}
              </h4>
              <p className="text-xs text-subtext0 mt-0.5 flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 text-blue" />
                {emp.jobTitle || 'No Title'}
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
              emp.status === 'ACTIVE'
                ? 'bg-green/10 text-green border border-green/20'
                : emp.status === 'ON_LEAVE'
                  ? 'bg-peach/10 text-peach border border-peach/20'
                  : 'bg-red/10 text-red border border-red/20'
            }`}
          >
            {emp.status || 'ACTIVE'}
          </span>
        </div>

        {/* Details Section */}
        <div className="space-y-2 py-3 border-t border-b border-surface0/30 text-xs">
          <div className="flex items-center gap-2 text-subtext1">
            <Building2 className="h-4 w-4 text-surface2 shrink-0" />
            <span className="truncate">
              {emp.departmentName || 'No Department'}
              {emp.departmentCode ? ` (${emp.departmentCode})` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-subtext1">
            <Mail className="h-4 w-4 text-surface2 shrink-0" />
            <a href={`mailto:${emp.email}`} className="truncate hover:underline">
              {emp.email}
            </a>
          </div>
          {emp.phone && (
            <div className="flex items-center gap-2 text-subtext1">
              <Phone className="h-4 w-4 text-surface2 shrink-0" />
              <span className="truncate">{emp.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface0/10">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-mauve uppercase tracking-wider bg-mauve/10 border border-mauve/20 px-2 py-0.5 rounded-md">
          <Shield className="h-3.5 w-3.5" />
          {emp.role?.replace('ROLE_', '')}
        </div>

        {hasEditPrivilege && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditClick(emp)}
              className="p-1.5 rounded-lg hover:bg-surface0 hover:text-blue text-subtext0 transition-all cursor-pointer"
              title="Edit Profile"
            >
              <Edit className="h-4 w-4" />
            </button>
            {emp.id !== me?.id && emp.id && (
              <button
                onClick={() => onDeleteClick(emp.id!)}
                className="p-1.5 rounded-lg hover:bg-red/10 hover:text-red text-subtext0 transition-all cursor-pointer"
                title="Delete Record"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
