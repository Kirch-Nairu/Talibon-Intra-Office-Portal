import { BarChart3, Building2, Files, Info, Megaphone } from 'lucide-react';
import PublicPanel from './PublicPanel';
import type { PublicContent } from './types';

const icons = [Building2, Info, Files, Megaphone];

export default function PublicGlance({ content }: { content: PublicContent }) {
    return <PublicPanel id="dashboards" title="Talibon at a Glance" icon={BarChart3} sampleLabel={content.sampleLabel}>
        <p className="mb-3 text-sm leading-5 text-slate-500 dark:text-slate-400">Public information preview. These are not official municipal statistics.</p>
        <div className="grid grid-cols-2 gap-3">
            {content.dashboard.map((item, index) => {
                const Icon = icons[index % icons.length];
                return <article key={item.label} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                    <Icon size={20} className="text-[#1769aa] dark:text-blue-300" aria-hidden="true" />
                    <h3 className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">{item.label}</h3>
                    <div className="mt-1 text-lg font-bold text-[#0b2852] dark:text-blue-100">{item.value}</div>
                    <p className="mt-1 text-xs leading-4 text-slate-500 dark:text-slate-400">{item.detail}</p>
                </article>;
            })}
        </div>
    </PublicPanel>;
}
