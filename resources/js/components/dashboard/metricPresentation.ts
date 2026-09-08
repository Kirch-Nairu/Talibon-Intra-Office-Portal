import { Check, Clock3, FileText, ShieldCheck, TriangleAlert } from 'lucide-react';

// Presentation only; counts, scope and links remain authoritative server data.
export function metricPresentation(label: string) {
    if (/overdue|inactive|denied|failed/i.test(label)) return { icon: TriangleAlert, surface: 'bg-rose-50 border-rose-100 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-100', badge: 'bg-rose-600 text-white' };
    if (/completed|approved|enrolled|configured/i.test(label)) return { icon: Check, surface: 'bg-emerald-50 border-emerald-100 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-100', badge: 'bg-emerald-600 text-white' };
    if (/pending|unassigned|action|due|attention|returned/i.test(label)) return { icon: Clock3, surface: 'bg-amber-50 border-amber-100 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-100', badge: 'bg-amber-500 text-slate-950' };
    return { icon: /security|privileged|mfa/i.test(label) ? ShieldCheck : FileText, surface: 'bg-blue-50 border-blue-100 text-blue-950 dark:bg-blue-950/30 dark:border-blue-900/60 dark:text-blue-100', badge: 'bg-[#0876cd] text-white' };
}
