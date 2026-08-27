import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { DashboardExperience } from './types';

export default function QuickActions({ actions }: { actions: DashboardExperience['quickActions'] }) {
    return (
        <section aria-labelledby="dashboard-quick-actions">
            <div className="mb-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Authoritative destinations</div>
                <h2 id="dashboard-quick-actions" className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">Quick access</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
                {actions.map((action) => (
                    <Link key={action.url} href={action.url} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-200 hover:bg-blue-50/40 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-[11px] font-bold text-slate-900 sm:text-sm">{action.label}</div>
                            <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-700" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-[10px] leading-5 text-slate-500 sm:text-xs">{action.description}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
