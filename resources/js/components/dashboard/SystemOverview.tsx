import { Link } from '@inertiajs/react';
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { formatDate, humanize } from './format';
import type { SystemOverviewData } from './types';

export default function SystemOverview({ overview }: { overview: SystemOverviewData }) {
    return (
        <section className="space-y-3.5" aria-labelledby="dashboard-system-overview">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300 sm:text-[10px]">Platform governance</div>
                    <h2 id="dashboard-system-overview" className="mt-1 text-base font-bold text-slate-950 dark:text-slate-100 sm:text-lg">Identity and security posture</h2>
                    <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">System administration status only. Municipal content remains governed by its normal authorization boundaries.</p>
                </div>
                <Link href="/admin" className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300 sm:text-xs">Accounts & Access <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>

            <div className="grid gap-3 lg:grid-cols-[0.7fr_1.3fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#142236]">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-slate-100"><KeyRound size={17} className="text-blue-700 dark:text-blue-300" aria-hidden="true" /> Office identity registry</div>
                    <div className="mt-3 grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/35"><div className="text-xl font-bold text-emerald-900 dark:text-emerald-200">{overview.officeIdentityStatus.configured}</div><div className="mt-1 text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Configured</div></div>
                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/35"><div className="text-xl font-bold text-amber-950 dark:text-amber-200">{overview.officeIdentityStatus.pending}</div><div className="mt-1 text-[9px] font-bold uppercase text-amber-800 dark:text-amber-300">Pending</div></div>
                    </div>
                    <p className="mt-3 text-[10px] leading-5 text-slate-500 dark:text-slate-400 sm:text-xs">Tracks configured office identities only; it does not grant access to office records or correspondence.</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#142236]">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-700 sm:px-5"><ShieldCheck size={17} className="text-blue-700 dark:text-blue-300" aria-hidden="true" /><h3 className="text-sm font-bold text-slate-950 dark:text-slate-100">Recent authentication and security events</h3></div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {overview.security.recentEvents.map((event, index) => (
                            <article key={`${event.action}-${event.createdAt || index}`} className="grid gap-2 px-4 py-3 sm:grid-cols-[150px_minmax(0,1fr)_120px] sm:items-center sm:px-5">
                                <div className="min-w-0"><div className="break-words text-[10px] font-bold text-slate-700 dark:text-slate-100 sm:text-xs">{humanize(event.action)}</div><div className="mt-0.5 break-words text-[9px] text-slate-400">{event.actor || 'System'}</div></div>
                                <div className="break-words text-[10px] leading-5 text-slate-600 dark:text-slate-300 sm:text-xs">{event.summary}</div>
                                <div className="sm:text-right"><div className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-300">{humanize(event.outcome)}</div><div className="mt-1 text-[9px] text-slate-400">{formatDate(event.createdAt)}</div></div>
                            </article>
                        ))}
                        {overview.security.recentEvents.length === 0 ? <div className="px-5 py-7 text-center text-[11px] text-slate-500 dark:text-slate-400">No recent authentication or security events.</div> : null}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-[10px] leading-5 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100 sm:text-xs">
                System administrators can govern accounts, MFA, office identity, audit, and security posture. This dashboard does not expand access to confidential municipal content.
            </div>
        </section>
    );
}
