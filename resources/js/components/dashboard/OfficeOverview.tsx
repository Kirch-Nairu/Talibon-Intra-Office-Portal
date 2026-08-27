import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Users } from 'lucide-react';
import { humanize } from './format';
import RecentWorkList from './RecentWorkList';
import type { OfficeOverviewData } from './types';

export default function OfficeOverview({ overview }: { overview: OfficeOverviewData }) {
    return (
        <section className="space-y-4" aria-labelledby="dashboard-office-overview">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Office leadership scope</div>
                    <h2 id="dashboard-office-overview" className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">Workload, status, and escalation</h2>
                </div>
                <Link href="/transactions?view=office_queue" className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 sm:text-xs">Open office work <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5"><Users size={16} className="text-blue-700" aria-hidden="true" /><h3 className="text-sm font-bold text-slate-950 sm:text-base">Bounded staff workload</h3></div>
                    <div className="hidden grid-cols-[1fr_90px_90px_100px] gap-3 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:grid">
                        <div>Employee</div><div>Active</div><div>Overdue</div><div>Needs action</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {overview.staffWorkload.map((row) => (
                            <div key={`${row.employee}-${row.position || ''}`} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_90px_90px_100px] sm:items-center sm:px-5">
                                <div><div className="text-[11px] font-semibold text-slate-800 sm:text-xs">{row.employee}</div><div className="mt-0.5 text-[9px] text-slate-400">{row.position || 'Position not recorded'}</div></div>
                                <div className="text-[10px] text-slate-600 sm:text-xs"><span className="font-bold text-slate-950">{row.active}</span> active</div>
                                <div className="text-[10px] text-slate-600 sm:text-xs"><span className={row.overdue > 0 ? 'font-bold text-rose-700' : 'font-bold text-slate-950'}>{row.overdue}</span> overdue</div>
                                <div className="text-[10px] text-slate-600 sm:text-xs"><span className="font-bold text-blue-800">{row.requiresAction}</span> items</div>
                            </div>
                        ))}
                        {overview.staffWorkload.length === 0 ? <div className="px-5 py-8 text-center text-[11px] text-slate-500">No active assigned office work.</div> : null}
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5"><AlertTriangle size={16} className="text-amber-700" aria-hidden="true" /><h3 className="text-sm font-bold text-slate-950 sm:text-base">Active status mix</h3></div>
                    <div className="divide-y divide-slate-100 px-4 sm:px-5">
                        {overview.statusOverview.map((row) => (
                            <div key={row.status} className="flex items-center justify-between gap-3 py-3">
                                <div className="text-[10px] font-semibold text-slate-600 sm:text-xs">{humanize(row.status)}</div>
                                <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-800">{row.count}</div>
                            </div>
                        ))}
                        {overview.statusOverview.length === 0 ? <div className="py-8 text-center text-[11px] text-slate-500">No active office status rows.</div> : null}
                    </div>
                </div>
            </div>

            <RecentWorkList title="Oldest unresolved office work" description="Bounded to active work currently accountable to this office." items={overview.oldestUnresolved} />
        </section>
    );
}
