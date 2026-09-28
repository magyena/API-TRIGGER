export const WORKFLOW_STAGES = [
  { id: 'REQUESTED', label: 'Requested', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'ASSIGNED', label: 'Assigned', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'COPYWRITING', label: 'Copywriting', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'EDITING', label: 'Editing', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'INTERNAL_REVIEW', label: 'Internal Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'REVISION', label: 'Revision', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'APPROVED', label: 'Approved', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'READY_TO_PUBLISH', label: 'Ready to Publish', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'PUBLISHED', label: 'Published', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

export const PRIORITIES = [
  { id: 'Urgent', label: 'Urgent', color: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold' },
  { id: 'Medium', label: 'Medium', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'Low', label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-300' },
];

export const RUNNING_STATUSES = [
  { id: 'Belum Running', label: 'Belum Running', color: 'bg-slate-100 text-slate-700' },
  { id: 'Running', label: 'Running', color: 'bg-emerald-100 text-emerald-800 font-medium' },
  { id: 'Paused', label: 'Paused', color: 'bg-amber-100 text-amber-800' },
  { id: 'Completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
];

export function getStageMeta(status: string) {
  return WORKFLOW_STAGES.find((s) => s.id === status) || { id: status, label: status, color: 'bg-slate-100 text-slate-700 border-slate-300' };
}

export function getPriorityMeta(priority: string) {
  return PRIORITIES.find((p) => p.id === priority) || { id: priority, label: priority, color: 'bg-slate-100 text-slate-700 border-slate-300' };
}

export function calculateDeadlineInfo(deadline: string | Date, currentStatus: string) {
  const target = new Date(deadline);
  const now = new Date();
  
  // Set both dates to midnight for clean day calculation
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = targetMidnight.getTime() - nowMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const isPublished = currentStatus === 'PUBLISHED';
  const isOverdue = !isPublished && diffDays < 0;
  const isToday = diffDays === 0;
  const isTomorrow = diffDays === 1;

  let text = '';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';

  if (isPublished) {
    text = `Completed (${target.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })})`;
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (isOverdue) {
    const daysAgo = Math.abs(diffDays);
    text = `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} overdue`;
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse';
  } else if (isToday) {
    text = 'Due today';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
  } else if (isTomorrow) {
    text = 'Due tomorrow';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-300 font-medium';
  } else if (diffDays > 0) {
    text = `Due in ${diffDays} days`;
    badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
  }

  return {
    diffDays,
    isOverdue,
    isToday,
    isTomorrow,
    text,
    badgeColor,
    formattedDate: target.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
}

export function formatShortDate(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
