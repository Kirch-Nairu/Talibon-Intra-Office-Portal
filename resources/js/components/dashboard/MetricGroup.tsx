import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { MetricGroupData } from './types';

export default function MetricGroup({ group }: { group: MetricGroupData }) {
    return (
        <section aria-labelledby={`dashboard-${group.key}-metrics`}>
            <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">{group.key} scope</div>
                    <h2 id={`dashboard-${group.key}-metrics`} className="mt-1 text-lg font-bold text-slate-950 dark:text-slate-100 sm:text-xl">{group.title}</h2>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {group.metrics.map((metric) => (
                    <Link
                        key={`${group.key}-${metric.label}`}
                        href={metric.link}
                        className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40 sm:p-5"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="text-2xl font-bold text-slate-950 sm:text-3xl">{metric.value}</div>
                            <ArrowUpRight size={15} className="text-slate-300 transition group-hover:text-blue-700" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[10px]">{metric.label}</div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
