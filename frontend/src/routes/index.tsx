import { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMeQuery } from '../hooks/useAuth';
import { 
  usePunchStatusQuery, 
  usePunchInMutation, 
  usePunchOutMutation, 
  useWorkHoursQuery, 
  useTeamPresenceQuery 
} from '../hooks/useAttendance';
import { useMyTasksQuery } from '../hooks/useTasks';
import { useMyLeavesQuery } from '../hooks/useLeaves';
import { 
  Clock, 
  MapPin, 
  Play, 
  Square, 
  CalendarDays, 
  CheckSquare, 
  ArrowRight,
  Users,
  TrendingUp,
  Activity,
  Loader2
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: DashboardComponent,
});

function DashboardComponent() {
  const [workLocation, setWorkLocation] = useState<'OFFICE' | 'WFH' | 'FIELD'>('OFFICE');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Fetch logged in profile detail via hook
  const { data: me } = useMeQuery();

  // Fetch today's punch status via hook
  const { data: punchStatus } = usePunchStatusQuery();

  // Fetch my tasks via hook
  const { data: tasks } = useMyTasksQuery();

  // Fetch my leaves via hook
  const { data: leaves } = useMyLeavesQuery();

  // Fetch work hours for this month via hook
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayString = today.toISOString().split('T')[0];

  const { data: workHours } = useWorkHoursQuery(me?.id, firstDayOfMonth, todayString);

  // Fetch today's overall department presence via hook
  const { data: teamPresence } = useTeamPresenceQuery(todayString);

  // Punch in/out mutations via hooks
  const punchInMutation = usePunchInMutation();
  const punchOutMutation = usePunchOutMutation();

  // Calculate dynamic ticking elapsed time when checked in or final elapsed time when checked out
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (punchStatus?.clockIn && !punchStatus?.clockOut) {
      const clockInStr = punchStatus.clockIn;
      const start = new Date(
        clockInStr.endsWith('Z') || clockInStr.includes('+') ? clockInStr : `${clockInStr}Z`
      ).getTime();
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = now - start;
        
        if (diff < 0) {
          setElapsedTime('00:00:00');
          return;
        }

        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        setElapsedTime(
          `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      };

      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else if (punchStatus?.clockIn && punchStatus?.clockOut) {
      const clockInStr = punchStatus.clockIn;
      const clockOutStr = punchStatus.clockOut;
      const start = new Date(
        clockInStr.endsWith('Z') || clockInStr.includes('+') ? clockInStr : `${clockInStr}Z`
      ).getTime();
      const end = new Date(
        clockOutStr.endsWith('Z') || clockOutStr.includes('+') ? clockOutStr : `${clockOutStr}Z`
      ).getTime();
      const diff = end - start;
      
      if (diff >= 0) {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(
          `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }
    } else {
      setElapsedTime('00:00:00');
    }

    return () => clearInterval(timer);
  }, [punchStatus]);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isPunchedIn = punchStatus?.clockIn && !punchStatus?.clockOut;
  const isPunchedOut = punchStatus?.clockIn && punchStatus?.clockOut;
  const pendingTasks = tasks?.filter(t => t.status !== 'DONE') || [];
  const pendingLeaves = leaves?.filter(l => l.status === 'PENDING') || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">
            {getGreeting()}, {me?.firstName || 'User'}!
          </h2>
          <p className="text-sm text-subtext0 mt-0.5">
            Here's what is happening at the workspace today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface0/50 border border-surface1/30 text-subtext1">
          <Activity className="h-4 w-4 text-green" />
          <span>Systems Status: Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Widget */}
        <div className="lg:col-span-1 glass-panel glass-panel-glow rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1">Attendance Punch</h3>
              <span className={`h-2.5 w-2.5 rounded-full ${isPunchedIn ? 'bg-green animate-pulse' : isPunchedOut ? 'bg-blue' : 'bg-red'}`} />
            </div>
            
            <div className="flex flex-col items-center justify-center py-6">
              <span className="text-4xl font-mono font-bold tracking-widest text-text">
                {elapsedTime}
              </span>
              <p className="text-xs text-subtext0 mt-2">
                {isPunchedIn 
                  ? (() => {
                      const clockInStr = punchStatus.clockIn!;
                      const dateObj = new Date(
                        clockInStr.endsWith('Z') || clockInStr.includes('+') ? clockInStr : `${clockInStr}Z`
                      );
                      return `Active session started at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    })()
                  : isPunchedOut
                    ? (() => {
                        const clockInStr = punchStatus.clockIn!;
                        const clockOutStr = punchStatus.clockOut!;
                        const inObj = new Date(
                          clockInStr.endsWith('Z') || clockInStr.includes('+') ? clockInStr : `${clockInStr}Z`
                        );
                        const outObj = new Date(
                          clockOutStr.endsWith('Z') || clockOutStr.includes('+') ? clockOutStr : `${clockOutStr}Z`
                        );
                        return `Session: ${inObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${outObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                      })()
                    : 'No active session today'
                }
              </p>
            </div>

            {/* Location selector */}
            {!isPunchedIn && !isPunchedOut && (
              <div className="space-y-2 mb-6">
                <label className="text-xs font-semibold text-subtext1 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-mauve" />
                  Work Location
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['OFFICE', 'WFH', 'FIELD'] as const).map(loc => (
                    <button
                      key={loc}
                      onClick={() => setWorkLocation(loc)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        workLocation === loc 
                          ? 'bg-mauve/10 border-mauve text-mauve' 
                          : 'bg-mantle border-surface0/60 text-subtext0 hover:border-surface1 hover:text-text'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {isPunchedIn ? (
              <button
                onClick={() => punchOutMutation.mutate()}
                disabled={punchOutMutation.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red hover:bg-red/90 text-crust py-3 px-4 font-semibold shadow-lg shadow-red/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {punchOutMutation.isPending ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Square className="h-4.5 w-4.5 fill-crust" />
                )}
                {punchOutMutation.isPending ? 'Punching Out...' : 'Punch Out'}
              </button>
            ) : isPunchedOut ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-surface0 text-subtext1/70 py-3 px-4 font-semibold border border-surface1/20 cursor-not-allowed"
              >
                <CheckSquare className="h-4.5 w-4.5 text-blue" />
                Attendance Completed
              </button>
            ) : (
              <button
                onClick={() => punchInMutation.mutate({ query: { location: workLocation } })}
                disabled={punchInMutation.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-green hover:bg-green/90 text-crust py-3 px-4 font-semibold shadow-lg shadow-green/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {punchInMutation.isPending ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Play className="h-4.5 w-4.5 fill-crust" />
                )}
                {punchInMutation.isPending ? 'Punching In...' : `Punch In (${workLocation})`}
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard 
            title="Work Hours (This Month)" 
            value={`${typeof workHours === 'number' ? workHours.toFixed(1) : '0.0'} hrs`}
            description={`Calculated since ${new Date(firstDayOfMonth).toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
            icon={<Clock className="h-6 w-6 text-blue" />}
            colorClass="from-blue/20 to-transparent"
          />
          <StatCard 
            title="Pending Actions" 
            value={`${pendingTasks.length} Tasks`}
            description={`${pendingLeaves.length} leave requests pending review`}
            icon={<CheckSquare className="h-6 w-6 text-mauve" />}
            colorClass="from-mauve/20 to-transparent"
          />
          <StatCard 
            title="Team Presence" 
            value={`${teamPresence?.filter((a: any) => a.clockIn && !a.clockOut).length || 0} Online`}
            description={`Out of ${teamPresence?.length || 0} active members today`}
            icon={<Users className="h-6 w-6 text-green" />}
            colorClass="from-green/20 to-transparent"
          />
          
          {/* Quick Actions glass panel */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/leaves"
                className="flex items-center justify-between p-3 rounded-xl bg-mantle hover:bg-surface0 border border-surface0/60 hover:border-surface1 transition-all text-xs font-semibold text-text"
              >
                <span>Request Leave</span>
                <ArrowRight className="h-4 w-4 text-mauve" />
              </Link>
              <Link
                to="/tasks"
                className="flex items-center justify-between p-3 rounded-xl bg-mantle hover:bg-surface0 border border-surface0/60 hover:border-surface1 transition-all text-xs font-semibold text-text"
              >
                <span>View Tasks</span>
                <ArrowRight className="h-4 w-4 text-blue" />
              </Link>
              <Link
                to="/employees"
                className="flex items-center justify-between p-3 rounded-xl bg-mantle hover:bg-surface0 border border-surface0/60 hover:border-surface1 transition-all text-xs font-semibold text-text"
              >
                <span>Browse Staff</span>
                <ArrowRight className="h-4 w-4 text-green" />
              </Link>
              <Link
                to="/leaves"
                className="flex items-center justify-between p-3 rounded-xl bg-mantle hover:bg-surface0 border border-surface0/60 hover:border-surface1 transition-all text-xs font-semibold text-text"
              >
                <span>WFH Application</span>
                <ArrowRight className="h-4 w-4 text-peach" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Presence details */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1">Active Presence</h3>
              <p className="text-xs text-subtext0 mt-0.5">Today's team clock activities</p>
            </div>
            <span className="text-xs font-mono text-subtext1 bg-crust px-2.5 py-1 rounded-md border border-surface0/60">
              {todayString}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-surface0 text-[11px] font-bold uppercase tracking-wider text-subtext0">
                  <th className="pb-3 pl-2">Employee</th>
                  <th className="pb-3">Clock In</th>
                  <th className="pb-3">Clock Out</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3 pr-2">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface0/30 text-xs">
                {teamPresence && teamPresence.length > 0 ? (
                  teamPresence.map((presence: any) => (
                    <tr key={presence.id} className="hover:bg-surface0/10">
                      <td className="py-3 pl-2 font-medium text-text flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-surface0 flex items-center justify-center text-[10px] text-mauve border border-surface1/30">
                          {presence.employeeName ? presence.employeeName.charAt(0) : 'E'}
                        </div>
                        <span>{presence.employeeName || 'Unknown Employee'}</span>
                      </td>
                      <td className="py-3 text-subtext1">
                        {presence.clockIn ? new Date(presence.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="py-3 text-subtext1">
                        {presence.clockOut ? new Date(presence.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (presence.clockIn ? <span className="text-green font-medium">Working</span> : '-')}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                          presence.workLocation === 'WFH' ? 'bg-peach/10 text-peach border border-peach/20' : 
                          presence.workLocation === 'FIELD' ? 'bg-blue/10 text-blue border border-blue/20' : 
                          'bg-green/10 text-green border border-green/20'
                        }`}>
                          {presence.workLocation || 'OFFICE'}
                        </span>
                      </td>
                      <td className="py-3 pr-2 font-mono text-subtext1">
                        {presence.workHours ? `${presence.workHours.toFixed(1)} hrs` : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-subtext0">
                      No records found for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dashboard Info Board */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-mauve" />
              Information board
            </h3>
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-mantle border border-surface0/60">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Leave Applications</h4>
                <p className="text-xs text-subtext0 mt-1 leading-relaxed">
                  Submit leaves under <span className="font-semibold text-text">Leaves & WFH</span>. Pending requests will be route-dispatched to your manager automatically.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-mantle border border-surface0/60">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Kanban Board</h4>
                <p className="text-xs text-subtext0 mt-1 leading-relaxed">
                  Review and progress tasks on the <span className="font-semibold text-text">Task Board</span> page. Tasks created by you or assigned to you are synced instantly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-mantle border border-surface0/60">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Profile Roles</h4>
                <p className="text-xs text-subtext0 mt-1 leading-relaxed">
                  Admin profiles can manage resources, add members, or edit details inside the <span className="font-semibold text-text">Employees</span> panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
}

function StatCard({ title, value, description, icon, colorClass }: StatCardProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex items-start gap-4 shadow-lg overflow-hidden relative">
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-tr ${colorClass} blur-xl`} />
      <div className="p-3 rounded-xl bg-surface0/80 border border-surface1/30">
        {icon}
      </div>
      <div className="space-y-1 min-w-0 flex-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-subtext0 truncate">{title}</h4>
        <div className="text-2xl font-extrabold text-text tracking-tight font-sans">
          {value}
        </div>
        <p className="text-xs text-subtext1 truncate leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
