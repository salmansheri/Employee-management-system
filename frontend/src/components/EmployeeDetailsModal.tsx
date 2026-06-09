import { X, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmployee: any;
  isAdmin: boolean;
  hasEditPrivilege: boolean;
  onEditClick: (emp: any) => void;
}

export function EmployeeDetailsModal({
  isOpen,
  onClose,
  selectedEmployee,
  isAdmin,
  hasEditPrivilege,
  onEditClick,
}: EmployeeDetailsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-crust/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl glass-panel glass-panel-glow p-6 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface0/60 mb-4">
              <h3 className="text-base font-bold text-text uppercase tracking-wider">Employee Profile</h3>
              <button onClick={onClose} className="text-subtext0 hover:text-text cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center py-4 text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-surface0 to-surface1 border-2 border-mauve/30 flex items-center justify-center font-bold text-2xl text-mauve mb-3">
                {selectedEmployee.firstName?.charAt(0)}
                {selectedEmployee.lastName?.charAt(0)}
              </div>
              <h4 className="text-lg font-bold text-text">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h4>
              <p className="text-xs text-subtext0 mt-1 uppercase font-semibold tracking-wider text-mauve">
                {selectedEmployee.role?.replace('ROLE_', '')}
              </p>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-mantle border border-surface0/30">
                <span className="text-subtext1 font-medium">Job Title</span>
                <span className="text-text font-bold">{selectedEmployee.jobTitle || 'No Title'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-mantle border border-surface0/30">
                <span className="text-subtext1 font-medium">Department</span>
                <span className="text-text font-bold">
                  {selectedEmployee.departmentName || 'No Department'}
                  {selectedEmployee.departmentCode ? ` (${selectedEmployee.departmentCode})` : ''}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-mantle border border-surface0/30">
                <span className="text-subtext1 font-medium">Email Address</span>
                <span className="text-text font-bold">{selectedEmployee.email}</span>
              </div>
              {selectedEmployee.phone && (
                <div className="flex justify-between items-center p-2 rounded-lg bg-mantle border border-surface0/30">
                  <span className="text-subtext1 font-medium">Phone Number</span>
                  <span className="text-text font-bold">{selectedEmployee.phone}</span>
                </div>
              )}
              {isAdmin && (
                <div className="flex justify-between items-center p-2 rounded-lg bg-mantle border border-surface0/30">
                  <span className="text-subtext1 font-medium">Salary</span>
                  <span className="text-text font-mono font-bold">
                    ${selectedEmployee.salary?.toLocaleString()}/yr
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center p-2 rounded-lg bg-mantle border border-surface0/30">
                <span className="text-subtext1 font-medium">Date Joined</span>
                <span className="text-text font-bold">
                  {selectedEmployee.dateOfJoining
                    ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-mantle border border-surface0/30">
                <span className="text-subtext1 font-medium">Reports To (Manager)</span>
                <span className="text-text font-bold">{selectedEmployee.managerName || 'Independent'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-surface0/60">
              {hasEditPrivilege && (
                <button
                  onClick={() => {
                    onClose();
                    onEditClick(selectedEmployee);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mauve text-crust font-semibold transition-all hover:bg-mauve/95 cursor-pointer text-xs"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-surface0 hover:bg-surface1 text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
