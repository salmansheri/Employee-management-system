import { X, Check } from 'lucide-react';
import type { LeaveRequestDto, WfhRequestDto } from '../client/types.gen';

interface ApprovalItemProps {
  request: LeaveRequestDto | WfhRequestDto;
  type: 'LEAVE' | 'WFH';
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalItem({ request, type, onApprove, onReject }: ApprovalItemProps) {
  const formattedStart = request.startDate ? new Date(request.startDate).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) : '';
  const formattedEnd = request.endDate ? new Date(request.endDate).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) : '';

  // Safe checks since leaveType is specific to LeaveRequestDto
  const leaveTypeLabel = type === 'LEAVE' && 'leaveType' in request ? request.leaveType : '';

  return (
    <div className="p-4 rounded-xl bg-mantle border border-surface0/60 flex flex-col justify-between gap-4 text-xs">
      <div>
        <div className="flex justify-between items-start gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-surface0 flex items-center justify-center font-bold text-[10px] text-mauve border border-surface1/30">
              {request.employeeName ? request.employeeName.charAt(0) : 'E'}
            </div>
            <div>
              <h4 className="font-bold text-text">{request.employeeName || 'Unknown Employee'}</h4>
              {type === 'LEAVE' && leaveTypeLabel && (
                <span className="text-[10px] font-bold text-mauve uppercase tracking-wider">{leaveTypeLabel} Leave</span>
              )}
            </div>
          </div>

          <div className="text-[10px] text-subtext0 text-right">
            <span className="block font-medium">Duration:</span>
            <span>
              {formattedStart} — {formattedEnd}
            </span>
          </div>
        </div>

        <p className="text-subtext1 text-[11px] leading-relaxed mt-1 pl-1 border-l border-surface0 bg-crust/20 p-2 rounded-r-lg">
          {request.reason}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-surface0/30 pt-3">
        <button
          onClick={onReject}
          className="flex items-center gap-1 hover:bg-red/10 text-red border border-transparent hover:border-red/20 py-1.5 px-3 rounded-lg font-semibold cursor-pointer transition-all"
        >
          <X className="h-4 w-4" />
          Reject
        </button>
        <button
          onClick={onApprove}
          className="flex items-center gap-1 bg-green hover:bg-green/90 text-crust py-1.5 px-3 rounded-lg font-semibold cursor-pointer transition-all"
        >
          <Check className="h-4 w-4" />
          Approve
        </button>
      </div>
    </div>
  );
}
