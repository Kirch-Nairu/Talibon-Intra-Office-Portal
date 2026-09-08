import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { metricPresentation } from './metricPresentation';
import type { MetricGroupData } from './types';

export default function MetricGroup({ group }: { group: MetricGroupData }) {
    return <section aria-labelledby={`dashboard-${group.key}-metrics`}>
        <h2 id={`dashboard-${group.key}-metrics`} className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">{group.title}</h2>
        <div className="grid grid-cols-2 gap-3 @min-[650px]:grid-cols-4">
            {group.metrics.map((metric) => {
                const { icon: Icon, surface, badge } = metricPresentation(metric.label);
                return <Link key={`${group.key}-${metric.label}`} href={metric.link} aria-label={`${metric.label}: ${metric.value}. Open related work.`} className={`group flex min-w-0 flex-col rounded-xl border p-3 transition hover:shadow-md sm:p-4 ${surface}`}>
                    <div className="flex flex-wrap items-start gap-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${badge}`}><Icon size={22} aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1"><div className="text-3xl font-bold leading-none tracking-tight tabular-nums">{metric.value.toLocaleString()}</div><div className="mt-2 text-xs leading-4">{metric.label}</div></div>
                    </div>
                    <span className="mt-auto flex items-center gap-1 pt-4 text-[10px] font-medium">View details <ArrowRight size={12} aria-hidden="true" /></span>
                </Link>;
            })}
        </div>
    </section>;
}
