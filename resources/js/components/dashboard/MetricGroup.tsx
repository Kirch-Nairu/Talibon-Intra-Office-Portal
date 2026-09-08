import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { metricPresentation } from './metricPresentation';
import type { MetricGroupData } from './types';

export default function MetricGroup({ group }: { group: MetricGroupData }) {
    const title = ({ personal: 'My work', office: 'Office workload', executive: 'Municipal workload', system: 'Accounts and security' } as Record<string, string>)[group.key] || group.title;
    return <section aria-labelledby={'dashboard-' + group.key + '-metrics'}>
        <h2 id={'dashboard-' + group.key + '-metrics'} className="mb-3 text-lg font-bold">{title}</h2>
        <div className="grid grid-cols-2 gap-3 @min-[650px]:grid-cols-3 @min-[950px]:grid-cols-4">
            {group.metrics.map((metric) => <Link key={metric.label} href={metric.link} aria-label={metric.label + ': ' + metric.value + '. Open related work.'} className="municipal-panel group relative flex min-w-0 flex-col gap-2 p-4 transition-colors duration-150 hover:border-[#1769aa]">
                <div className={'text-[28px] font-bold leading-none tracking-tight tabular-nums ' + metricPresentation(metric.label)}>{metric.value.toLocaleString()}</div>
                <div className="pr-3 text-[13px] leading-5 text-slate-600 dark:text-slate-300">{metric.label}</div>
                <ArrowUpRight size={14} className="absolute right-3 top-4 text-slate-400 group-hover:text-[#1769aa] dark:group-hover:text-blue-300" aria-hidden="true" />
            </Link>)}
        </div>
    </section>;
}
