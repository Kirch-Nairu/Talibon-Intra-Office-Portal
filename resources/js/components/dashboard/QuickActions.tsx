import { Link } from '@inertiajs/react';
import { ArrowRight, LayoutGrid, ShieldCheck } from 'lucide-react';
import { portalDestinations } from '../../navigation/portalNavigation';
import type { DashboardExperience } from './types';

const tileColors = [
    'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
    'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
];

export default function QuickActions({ actions }: { actions: DashboardExperience['quickActions'] }) {
    if (!actions.length) return null;
    return <section className="municipal-panel p-4" aria-labelledby="dashboard-quick-actions">
        <h2 id="dashboard-quick-actions" className="municipal-panel-title"><LayoutGrid size={17} className="text-blue-800 dark:text-blue-300" />Quick Access</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 @min-[540px]:grid-cols-3 @min-[800px]:grid-cols-6">
            {actions.map((action, index) => {
                const Icon = Object.values(portalDestinations).find((item) => action.url.split('?')[0] === item.href)?.icon || ShieldCheck;
                return <Link key={action.url} href={action.url} className={`group flex min-w-0 flex-col items-center rounded-lg px-3 py-4 text-center transition hover:ring-1 hover:ring-blue-300 ${tileColors[index % tileColors.length]}`}>
                    <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
                    <div className="mt-2 text-xs font-semibold leading-4 text-slate-900 dark:text-slate-100">{action.label}</div>
                    <p className="mt-1.5 text-[10px] leading-4 text-slate-600 dark:text-slate-400">{action.description}</p>
                    <ArrowRight size={12} className="mt-auto pt-1 opacity-50" aria-hidden="true" />
                </Link>;
            })}
        </div>
    </section>;
}
