import { Link } from '@inertiajs/react';
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { formatDate, humanize } from './format';
import type { SystemOverviewData } from './types';

export default function SystemOverview({ overview }: { overview: SystemOverviewData }) {
    return (
        <section className="space-y-4" aria-labelledby="dashboard-system-overview">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Platform governance</div>
                    <h2 id="dashboard-system-overview" className="mt-1 text-lg font-bold text-slate-950 dark:text-slate-100 sm:text-xl">Security and office digital identity</h2>
                </div>
                <Link href="/admin" className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 sm:text-xs">System Administration <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><KeyRound size={17} className="text-blue-700" aria-hidden="true" /> Office identity registry</div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-emerald-50 p-4"><div className="text-2xl font-bold text-emerald-900">{overview.officeIdentityStatus.configured}</div><div className="mt-1 text-[9px] font-bold uppercase text-emerald-700">Configured</div></div>
                        <div className="rounded-xl bg-amber-50 p-4"><div className="text-2xl font-bold text-amber-950">{overview.officeIdentityStatus.pending}</div><div className="mt-1 text-[9px] font-bold uppercase text-amber-800">Pending</div></div>
                    </div>
                    <p className="mt-4 text-[10px] leading-5 text-slate-500 sm:text-xs">Status only. Official office-email migration remains outside this dashboard slice.</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5"><ShieldCheck size={17} className="text-blue-700" aria-hidden="true" /><h3 className="text-sm font-bold text-slate-950 sm:text-base">Recent authentication and security events</h3></div>
                    <div className="divide-y divide-slate-100">
                        {overview.security.recentEvents.map((event, index) => (
                            <div key={`${event.action}-${event.createdAt || index}`} className="grid gap-2 px-4 py-3 sm:grid-cols-[150px_1fr_120px] sm:items-center sm:px-5">
                                <div><div className="text-[10px] font-bold text-slate-700 sm:text-xs">{humanize(event.action)}</div><div className="mt-0.5 text-[9px] text-slate-400">{event.actor || 'System'}</div></div>
                                <div className="text-[10px] leading-5 text-slate-600 sm:text-xs">{event.summary}</div>
                                <div className="sm:text-right"><div className="text-[9px] font-bold uppercase text-slate-500">{event.outcome}</div><div className="mt-1 text-[9px] text-slate-400">{formatDate(event.createdAt)}</div></div>
                            </div>
                        ))}
                        {overview.security.recentEvents.length === 0 ? <div className="px-5 py-8 text-center text-[11px] text-slate-500">No recent authentication or security events.</div> : null}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-[10px] leading-5 text-blue-950 sm:rounded-3xl sm:p-5 sm:text-xs">
                Operational figures on this profile are bounded aggregates already authorized by the transaction capability model. They do not grant correspondence, attachment, trace, or private-record access.
            </div>
        </section>
    );
}
