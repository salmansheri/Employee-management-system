import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KanbanColumnProps {
  title: string;
  tasks: Array<any>;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  getPriorityColor: (p: any) => string;
  onMove: (task: any, dir: 'forward' | 'backward') => void;
}

export function KanbanColumn({
  title,
  tasks,
  status,
  getPriorityColor,
  onMove,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-mantle/50 rounded-2xl border border-surface0/60 p-4 h-[75vh] w-full min-w-0">
      <div className="flex items-center justify-between pb-3 border-b border-surface0 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
          {title}
        </h3>
        <span className="h-5 px-2.5 rounded-full bg-surface0 flex items-center justify-center font-mono text-[10px] text-subtext1 font-bold">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
        <AnimatePresence initial={false}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                layoutId={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 rounded-xl bg-mantle hover:bg-surface0/30 border border-surface0/60 hover:border-surface1/60 shadow-sm transition-all flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex justify-between items-start gap-1 mb-1.5">
                    <span
                      className={`inline-flex px-1.5 py-0.2 rounded-full text-[8px] font-bold uppercase ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-text leading-snug">{task.title}</h4>
                  {task.description && (
                    <p className="text-subtext1 text-[11px] leading-relaxed mt-1 line-clamp-3">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5 pt-2 border-t border-surface0/30 text-[10px]">
                  <div className="flex items-center justify-between text-subtext0">
                    <span className="truncate">By: {task.assignedByName || 'Manager'}</span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 font-mono text-subtext1">
                        <Clock className="h-3 w-3 shrink-0 text-blue" />
                        {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Move action buttons */}
                  <div className="flex justify-between items-center gap-2">
                    <button
                      disabled={status === 'TODO'}
                      onClick={() => onMove(task, 'backward')}
                      className="flex-1 py-1 rounded-md bg-surface0/40 hover:bg-surface0 border border-surface1/20 text-subtext0 hover:text-text flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={status === 'DONE'}
                      onClick={() => onMove(task, 'forward')}
                      className="flex-1 py-1 rounded-md bg-surface0/40 hover:bg-surface0 border border-surface1/20 text-subtext0 hover:text-text flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-surface2 text-center select-none py-12">
              No tasks in this stage
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
