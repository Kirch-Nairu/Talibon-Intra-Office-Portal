import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Building2 } from 'lucide-react';
import RecentWorkList from './RecentWorkList';
import type { ExecutiveOverviewData } from './types';

export default function ExecutiveOverview({ overview }: { overview: ExecutiveOverviewData }) {
    return (
        <section className="space-y-4" aria-labelledby="dashboard-executive-overview">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Authorized municipal aggregates</div>
                    <h2 id="dashboard-executive-overview" className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">Office bottlenecks and unresolved work</h2>
                </div>
                <Link href="/mayor-office" className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 sm:text-xs">Executive workspace <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2"><Building2 size={16} className="text-blue-700" aria-hidden="true" /><h3 className="text-sm font-bold text-slate-950 sm:text-base">Workload by current office</h3></div>
                    <span className="text-[9px] text-slate-400 sm:text-[10px]">Transaction authority only</span>
                </div>
                <div className="hidden grid-cols-[1.5fr_repeat(4,90px)] gap-3 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-[9px] font-bold uppercase tracking-wide text-slate-400 md:grid">
                    <div>Office</div><div>Active</div><div>Unassigned</div><div>Due soon</div><div>Overdue</div>
                </div>
                <div className="divide-y divide-slate-100">
                    {overview.departmentWorkload.map((office) => (
                        <div key={office.id} className="grid gap-2 px-4 py-3 sm:px-5 md:grid-cols-[1.5fr_repeat(4,90px)] md:items-center">
                            <div><div className="text-[11px] font-semibold text-slate-800 sm:text-xs">{office.shortName || office.name}</div><div className="mt-0.5 text-[9px] text-slate-400">{office.code}</div></div>
                            <div className="text-[10px] text-slate-600 sm:text-xs"><span className="font-bold text-slate-950">{office.active}</span> active</div>
                            <div className="text-[10px] text-slate-600 sm:text-xs">{office.unassigned} unassigned</div>
                            <div className="text-[10px] text-amber-700 sm:text-xs">{office.dueSoon} due</div>
                            <div className="inline-flex items-center gap-1 text-[10px] text-rose-700 sm:text-xs"><AlertTriangle size={11} aria-hidden="true" /> {office.overdue} overdue</div>
                        </div>
                    ))}
                    {overview.departmentWorkload.length === 0 ? <div className="px-5 py-8 text-center text-[11px] text-slate-500">No active municipal workload.</div> : null}
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <RecentWorkList title="Oldest unresolved work" description="Municipality-wide transactions inside existing executive visibility." items={overview.oldestUnresolved} />
                <RecentWorkList title="Recently completed" description="Completed during the bounded recent period." items={overview.recentlyCompleted} />
            </div>
        </section>
    );
}
