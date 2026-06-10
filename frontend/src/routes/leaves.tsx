import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMeQuery } from '../hooks/useAuth';
import { 
  useMyLeavesQuery, 
  useMyWfhQuery, 
  usePendingLeavesQuery, 
  usePendingWfhQuery, 
  useApplyLeaveMutation, 
  useApplyWfhMutation, 
  useApproveLeaveMutation, 
  useRejectLeaveMutation, 
  useApproveWfhMutation, 
  useRejectWfhMutation 
} from '../hooks/useLeaves';
import { 
  Calendar, 
  X, 
  Send, 
  Loader2, 
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RequestListItem } from '../components/RequestListItem';
import { ApprovalItem } from '../components/ApprovalItem';
import { DatePicker } from '../components/DatePicker';
import { FormItem, FormLabel, FormControl, FormMessage } from '../components/ui/form';
import { AlertDialog } from '../components/ui/alert-dialog';
import { z } from 'zod';
import { toast } from 'sonner';

const leaveSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  leaveType: z.enum(['SICK', 'CASUAL', 'ANNUAL', 'UNPAID']),
  reason: z.string().min(5, 'Please provide a more descriptive reason')
});

const wfhSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(5, 'Please provide a more descriptive reason')
});

const rejectionSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required')
});

export const Route = createFileRoute('/leaves')({
  component: LeavesComponent,
});

function LeavesComponent() {
  const [activeTab, setActiveTab] = useState<'my-requests' | 'new-request' | 'approvals'>('my-requests');
  const [requestType, setRequestType] = useState<'LEAVE' | 'WFH'>('LEAVE');
  
  // Rejection modal state
  const [rejectionTarget, setRejectionTarget] = useState<{ id: string; type: 'LEAVE' | 'WFH' } | null>(null);

  // Approval confirmation modal state
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<{ id: string; type: 'LEAVE' | 'WFH' } | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch logged in profile via hook
  const { data: me } = useMeQuery();

  // Fetch my leaves and WFH via hooks
  const { data: myLeaves, isLoading: loadingLeaves } = useMyLeavesQuery();
  const { data: myWfh, isLoading: loadingWfh } = useMyWfhQuery();

  // Fetch pending team requests (for Manager / Admin) via hooks
  const isManagerOrAdmin = me?.role === 'ROLE_MANAGER' || me?.role === 'ROLE_ADMIN';
  const { data: pendingLeaves } = usePendingLeavesQuery(isManagerOrAdmin);
  const { data: pendingWfh } = usePendingWfhQuery(isManagerOrAdmin);

  // Mutations via hooks
  const applyLeaveMutation = useApplyLeaveMutation();
  const applyWfhMutation = useApplyWfhMutation();
  const approveLeaveMutation = useApproveLeaveMutation();
  const rejectLeaveMutation = useRejectLeaveMutation();
  const approveWfhMutation = useApproveWfhMutation();
  const rejectWfhMutation = useRejectWfhMutation();

  // TanStack Form hooks
  const leaveForm = useForm({
    defaultValues: {
      startDate: '',
      endDate: '',
      leaveType: 'CASUAL' as 'SICK' | 'CASUAL' | 'ANNUAL' | 'UNPAID',
      reason: ''
    },
    validators: {
      onChange: leaveSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setFormSuccess(null);
      setActionLoading(true);
      console.log('[Leave Application] Submitting Leave Request payload:', value);

      try {
        if (!value.startDate || !value.endDate || !value.reason) {
          throw new Error('Please fill in all fields');
        }
        if (new Date(value.startDate) > new Date(value.endDate)) {
          throw new Error('Start date cannot be after end date');
        }
        await applyLeaveMutation.mutateAsync({ body: value as any });
        console.log('[Leave Application] Leave request submitted successfully.');
        toast.success('Leave requested', {
          description: 'Your leave application has been submitted to your manager.'
        });
        leaveForm.reset();
        setFormSuccess('Leave application submitted successfully!');
        setTimeout(() => setFormSuccess(null), 3000);
        setActiveTab('my-requests');
      } catch (err: any) {
        console.error('[Leave Application] Submission failed:', err);
        toast.error('Submission failed', {
          description: err.response?.data?.message || err.message || 'Error occurred.'
        });
        setFormError(err.response?.data?.message || err.message || 'Error submitting application');
      } finally {
        setActionLoading(false);
      }
    }
  });

  const wfhForm = useForm({
    defaultValues: {
      startDate: '',
      endDate: '',
      reason: ''
    },
    validators: {
      onChange: wfhSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setFormSuccess(null);
      setActionLoading(true);
      console.log('[WFH Application] Submitting WFH Request payload:', value);

      try {
        if (!value.startDate || !value.endDate || !value.reason) {
          throw new Error('Please fill in all fields');
        }
        if (new Date(value.startDate) > new Date(value.endDate)) {
          throw new Error('Start date cannot be after end date');
        }
        await applyWfhMutation.mutateAsync({ body: value as any });
        console.log('[WFH Application] WFH request submitted successfully.');
        toast.success('WFH requested', {
          description: 'Your remote work application has been submitted to your manager.'
        });
        wfhForm.reset();
        setFormSuccess('WFH application submitted successfully!');
        setTimeout(() => setFormSuccess(null), 3000);
        setActiveTab('my-requests');
      } catch (err: any) {
        console.error('[WFH Application] Submission failed:', err);
        toast.error('Submission failed', {
          description: err.response?.data?.message || err.message || 'Error occurred.'
        });
        setFormError(err.response?.data?.message || err.message || 'Error submitting application');
      } finally {
        setActionLoading(false);
      }
    }
  });

  const rejectionForm = useForm({
    defaultValues: {
      reason: ''
    },
    validators: {
      onChange: rejectionSchema,
    },
    onSubmit: async ({ value }) => {
      if (!rejectionTarget) return;
      console.log(`[Approval Tray] Manager rejecting request ID ${rejectionTarget.id} (Type: ${rejectionTarget.type}) with reason:`, value.reason);

      try {
        if (rejectionTarget.type === 'LEAVE') {
          await rejectLeaveMutation.mutateAsync({ 
            path: { id: rejectionTarget.id }, 
            query: { reason: value.reason } 
          });
        } else {
          await rejectWfhMutation.mutateAsync({ 
            path: { id: rejectionTarget.id }, 
            query: { reason: value.reason } 
          });
        }
        console.log('[Approval Tray] Rejection processed successfully.');
        toast.success('Request rejected', {
          description: `The ${rejectionTarget.type.toLowerCase()} request was marked as rejected.`
        });
        setRejectionTarget(null);
        rejectionForm.reset();
      } catch (err: any) {
        console.error('[Approval Tray] Rejection failed:', err);
        toast.error('Rejection failed', {
          description: err.response?.data?.message || err.message || 'Error occurred.'
        });
      }
    }
  });

  const handleApproveClick = (id: string, type: 'LEAVE' | 'WFH') => {
    setApproveTarget({ id, type });
    setIsApproveConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    const { id, type } = approveTarget;
    console.log(`[Approval Tray] Manager approving request ID ${id} (Type: ${type})`);
    try {
      if (type === 'LEAVE') {
        await approveLeaveMutation.mutateAsync({ path: { id } });
      } else {
        await approveWfhMutation.mutateAsync({ path: { id } });
      }
      console.log('[Approval Tray] Approval processed successfully.');
      toast.success('Request approved', {
        description: `The ${type.toLowerCase()} request was marked as approved.`
      });
    } catch (err: any) {
      console.error('[Approval Tray] Approval failed:', err);
      toast.error('Approval failed', {
        description: err.response?.data?.message || err.message || 'Error occurred.'
      });
    } finally {
      setIsApproveConfirmOpen(false);
      setApproveTarget(null);
    }
  };

  const totalPendingApprovals = (pendingLeaves?.length || 0) + (pendingWfh?.length || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Leaves & WFH Applications</h2>
          <p className="text-sm text-subtext0 mt-0.5">
            Submit leave requests, apply for remote work, and track processing histories.
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-surface0/60 w-full">
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider px-4 border-b-2 cursor-pointer transition-all ${
            activeTab === 'my-requests' 
              ? 'border-mauve text-mauve font-bold' 
              : 'border-transparent text-subtext0 hover:text-text'
          }`}
        >
          My Applications
        </button>
        <button
          onClick={() => setActiveTab('new-request')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider px-4 border-b-2 cursor-pointer transition-all ${
            activeTab === 'new-request' 
              ? 'border-mauve text-mauve font-bold' 
              : 'border-transparent text-subtext0 hover:text-text'
          }`}
        >
          New Application
        </button>
        {isManagerOrAdmin && (
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider px-4 border-b-2 cursor-pointer transition-all relative ${
              activeTab === 'approvals' 
                ? 'border-mauve text-mauve font-bold' 
                : 'border-transparent text-subtext0 hover:text-text'
            }`}
          >
            Approvals Tray
            {totalPendingApprovals > 0 && (
              <span className="absolute -top-1 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red text-[9px] font-bold text-crust">
                {totalPendingApprovals}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Content wrapper */}
      <div className="mt-4">
        {activeTab === 'my-requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leaves List */}
            <div className="glass-panel rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1 mb-4 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-mauve" />
                Leave Applications
              </h3>
              
              {loadingLeaves ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-mauve" />
                </div>
              ) : myLeaves && myLeaves.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {myLeaves.map((leave: any) => (
                    <RequestListItem 
                      key={leave.id}
                      title={`${leave.leaveType} Leave`}
                      startDate={leave.startDate}
                      endDate={leave.endDate}
                      reason={leave.reason}
                      status={leave.status}
                      approvedBy={leave.approvedByName}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-subtext0">
                  No leave requests submitted yet
                </div>
              )}
            </div>

            {/* WFH List */}
            <div className="glass-panel rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1 mb-4 flex items-center gap-2">
                <Home className="h-4.5 w-4.5 text-blue" />
                WFH Applications
              </h3>
              
              {loadingWfh ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue" />
                </div>
              ) : myWfh && myWfh.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {myWfh.map((wfh: any) => (
                    <RequestListItem 
                      key={wfh.id}
                      title="Work From Home Session"
                      startDate={wfh.startDate}
                      endDate={wfh.endDate}
                      reason={wfh.reason}
                      status={wfh.status}
                      approvedBy={wfh.approvedByName}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-subtext0">
                  No WFH requests submitted yet
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'new-request' && (
          <div className="max-w-xl mx-auto glass-panel glass-panel-glow rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1 mb-6">Create Request Application</h3>
            
            {formError && (
              <div className="mb-4 rounded-lg bg-red/10 border border-red/20 p-3 text-xs text-red">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 rounded-lg bg-green/10 border border-green/20 p-3 text-xs text-green">
                {formSuccess}
              </div>
            )}

            {/* Switch selector */}
            <div className="flex bg-mantle p-1 rounded-xl border border-surface0/60 mb-6">
              <button
                type="button"
                onClick={() => setRequestType('LEAVE')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wider cursor-pointer transition-all ${
                  requestType === 'LEAVE' 
                    ? 'bg-mauve text-crust shadow-md' 
                    : 'text-subtext0 hover:text-text'
                }`}
              >
                Leave Request
              </button>
              <button
                type="button"
                onClick={() => setRequestType('WFH')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wider cursor-pointer transition-all ${
                  requestType === 'WFH' 
                    ? 'bg-mauve text-crust shadow-md' 
                    : 'text-subtext0 hover:text-text'
                }`}
              >
                Work From Home
              </button>
            </div>

            {requestType === 'LEAVE' ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  leaveForm.handleSubmit();
                }} 
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <leaveForm.Field name="startDate">
                    {(field: any) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.state.value}
                            onChange={(date) => field.handleChange(date)}
                          />
                        </FormControl>
                        <FormMessage>{field.state.meta.errors}</FormMessage>
                      </FormItem>
                    )}
                  </leaveForm.Field>
                  <leaveForm.Field name="endDate">
                    {(field: any) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.state.value}
                            onChange={(date) => field.handleChange(date)}
                            minDate={leaveForm.state.values.startDate}
                          />
                        </FormControl>
                        <FormMessage>{field.state.meta.errors}</FormMessage>
                      </FormItem>
                    )}
                  </leaveForm.Field>
                </div>

                <leaveForm.Field name="leaveType">
                  {(field: any) => (
                    <FormItem>
                      <FormLabel>Leave Type</FormLabel>
                      <FormControl>
                        <select
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
                        >
                          <option value="CASUAL">Casual Leave</option>
                          <option value="SICK">Sick Leave</option>
                          <option value="ANNUAL">Annual Leave</option>
                          <option value="UNPAID">Unpaid Leave</option>
                        </select>
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </leaveForm.Field>

                <leaveForm.Field name="reason">
                  {(field: any) => (
                    <FormItem>
                      <FormLabel>Application Reason</FormLabel>
                      <FormControl>
                        <textarea
                          required
                          rows={4}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Specify reason for leave request..."
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text placeholder-surface2 outline-none focus:border-mauve transition-all resize-none"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </leaveForm.Field>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-mauve hover:bg-mauve/95 text-crust py-2.5 px-4 font-semibold shadow-lg shadow-mauve/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4.5 w-4.5" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  wfhForm.handleSubmit();
                }} 
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <wfhForm.Field name="startDate">
                    {(field: any) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.state.value}
                            onChange={(date) => field.handleChange(date)}
                          />
                        </FormControl>
                        <FormMessage>{field.state.meta.errors}</FormMessage>
                      </FormItem>
                    )}
                  </wfhForm.Field>
                  <wfhForm.Field name="endDate">
                    {(field: any) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.state.value}
                            onChange={(date) => field.handleChange(date)}
                            minDate={wfhForm.state.values.startDate}
                          />
                        </FormControl>
                        <FormMessage>{field.state.meta.errors}</FormMessage>
                      </FormItem>
                    )}
                  </wfhForm.Field>
                </div>

                <wfhForm.Field name="reason">
                  {(field: any) => (
                    <FormItem>
                      <FormLabel>Application Reason</FormLabel>
                      <FormControl>
                        <textarea
                          required
                          rows={4}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Specify reason for remote work request..."
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text placeholder-surface2 outline-none focus:border-mauve transition-all resize-none"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </wfhForm.Field>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-mauve hover:bg-mauve/95 text-crust py-2.5 px-4 font-semibold shadow-lg shadow-mauve/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4.5 w-4.5" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'approvals' && isManagerOrAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Leaves approval */}
            <div className="glass-panel rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1 mb-4 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-mauve" />
                Pending Leave Reviews
              </h3>

              {pendingLeaves && pendingLeaves.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {pendingLeaves.map((request: any) => (
                    <ApprovalItem
                      key={request.id}
                      request={request}
                      type="LEAVE"
                      onApprove={() => handleApproveClick(request.id, 'LEAVE')}
                      onReject={() => setRejectionTarget({ id: request.id, type: 'LEAVE' })}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-subtext0">
                  No pending leave approvals
                </div>
              )}
            </div>

            {/* Pending WFH approval */}
            <div className="glass-panel rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1 mb-4 flex items-center gap-2">
                <Home className="h-4.5 w-4.5 text-blue" />
                Pending WFH Reviews
              </h3>

              {pendingWfh && pendingWfh.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {pendingWfh.map((request: any) => (
                    <ApprovalItem
                      key={request.id}
                      request={request}
                      type="WFH"
                      onApprove={() => handleApproveClick(request.id, 'WFH')}
                      onReject={() => setRejectionTarget({ id: request.id, type: 'WFH' })}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-subtext0">
                  No pending WFH approvals
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* REJECTION MODAL OVERLAY */}
      <AnimatePresence>
        {rejectionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setRejectionTarget(null);
                rejectionForm.reset();
              }}
              className="fixed inset-0 bg-crust/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl glass-panel glass-panel-glow p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-surface0/60 mb-4">
                <h3 className="text-base font-bold text-text uppercase tracking-wider">Reject Request</h3>
                <button onClick={() => {
                  setRejectionTarget(null);
                  rejectionForm.reset();
                }} className="text-subtext0 hover:text-text cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  rejectionForm.handleSubmit();
                }} 
                className="space-y-4"
              >
                <rejectionForm.Field name="reason">
                  {(field: any) => (
                    <FormItem>
                      <FormLabel>Provide rejection reason</FormLabel>
                      <FormControl>
                        <textarea
                          required
                          rows={4}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Provide comment for employee explaining rejection..."
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text placeholder-surface2 outline-none focus:border-mauve transition-all resize-none"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </rejectionForm.Field>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface0/60">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectionTarget(null);
                      rejectionForm.reset();
                    }}
                    className="px-4 py-2 rounded-lg bg-surface0 hover:bg-surface1 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red text-crust font-semibold transition-all hover:bg-red/90 cursor-pointer text-xs"
                  >
                    Confirm Reject
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPROVAL CONFIRMATION ALERT DIALOG */}
      <AlertDialog
        isOpen={isApproveConfirmOpen}
        title="Approve Request"
        description={`Are you sure you want to approve this ${approveTarget?.type.toLowerCase() || 'request'} request?`}
        confirmText="Approve"
        onCancel={() => {
          setIsApproveConfirmOpen(false);
          setApproveTarget(null);
        }}
        onConfirm={handleConfirmApprove}
      />

    </div>
  );
}
