import { Clock } from 'lucide-react';

interface RequestListItemProps {
  title: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
}

export function RequestListItem({
  title,
  startDate,
  endDate,
  reason,
  status,
  approvedBy,
}: RequestListItemProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green/10 text-green border border-green/20';
      case 'REJECTED':
        return 'bg-red/10 text-red border border-red/20';
      default:
        return 'bg-yellow/10 text-yellow border border-yellow/20';
    }
  };

  const formattedStart = new Date(startDate).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedEnd = new Date(endDate).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-4 rounded-xl bg-mantle hover:bg-surface0/35 border border-surface0/60 transition-all flex flex-col justify-between gap-3 text-xs">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-text">{title}</h4>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge()}`}>
            {status}
          </span>
        </div>
        <p className="text-subtext1 text-[11px] leading-relaxed">{reason}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-surface0/30 text-[10px] text-subtext0">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-blue shrink-0" />
          <span>
            {formattedStart} — {formattedEnd}
          </span>
        </div>
        {status === 'APPROVED' && approvedBy && <span className="italic">Approved by: {approvedBy}</span>}
      </div>
    </div>
  );
}
