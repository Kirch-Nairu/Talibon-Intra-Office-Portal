import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { DashboardExperience } from './types';

export default function QuickActions({ actions }: { actions: DashboardExperience['quickActions'] }) {
    if (actions.length === 0) return null;

    return (
        <section aria-labelledby="dashboard-quick-actions">
            <div className="mb-2.5">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300 sm:text-[10px]">Next actions</div>
                <h2 id="dashboard-quick-actions" className="mt-1 text-base font-bold text-slate-950 dark:text-slate-100 sm:text-lg">Open a working area</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {actions.map((action) => (
                    <Link
                        key={action.url}
                        href={action.url}
                        className="group min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-[#142236] dark:hover:border-blue-700 dark:hover:bg-blue-950/30 sm:rounded-2xl sm:p-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="break-words text-[11px] font-bold text-slate-900 dark:text-slate-100 sm:text-sm">{action.label}</div>
                            <ArrowRight size={15} className="shrink-0 text-slate-300 group-hover:text-blue-700 dark:text-slate-600 dark:group-hover:text-blue-300" aria-hidden="true" />
                        </div>
                        <p className="mt-1.5 text-[10px] leading-4 text-slate-500 dark:text-slate-400 sm:text-xs sm:leading-5">{action.description}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
