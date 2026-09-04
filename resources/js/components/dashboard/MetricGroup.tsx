import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { MetricGroupData } from './types';

export default function MetricGroup({ group }: { group: MetricGroupData }) {
    return (
        <section aria-labelledby={`dashboard-${group.key}-metrics`}>
            <div className="mb-2.5">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300 sm:text-[10px]">Operational status</div>
                <h2 id={`dashboard-${group.key}-metrics`} className="mt-1 text-base font-bold text-slate-950 dark:text-slate-100 sm:text-lg">{group.title}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {group.metrics.map((metric) => (
                    <Link
                        key={`${group.key}-${metric.label}`}
                        href={metric.link}
                        aria-label={`${metric.label}: ${metric.value}. Open related work.`}
                        className="group min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-[#142236] dark:hover:border-blue-700 dark:hover:bg-blue-950/30 sm:rounded-2xl sm:p-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="text-xl font-bold text-slate-950 dark:text-slate-100 sm:text-2xl">{metric.value}</div>
                            <ArrowUpRight size={14} className="shrink-0 text-slate-300 transition group-hover:text-blue-700 dark:text-slate-600 dark:group-hover:text-blue-300" aria-hidden="true" />
                        </div>
                        <div className="mt-2 break-words text-[9px] font-bold uppercase leading-4 tracking-wide text-slate-500 dark:text-slate-400 sm:text-[10px]">{metric.label}</div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
