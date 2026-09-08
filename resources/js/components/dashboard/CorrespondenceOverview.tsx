import { Link } from '@inertiajs/react';
import { ArrowRight, Inbox } from 'lucide-react';
import { formatDate, humanize } from './format';
import type { CorrespondenceItem, CorrespondenceOverviewData } from './types';

function CorrespondenceList({ title, items, dateKey }: {
    title: string;
    items: CorrespondenceItem[];
    dateKey: 'receivedAt' | 'routedAt';
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white  transition-colors dark:border-slate-700 dark:bg-[#142236]">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700 sm:px-5">
                <h3 className="text-sm font-bold text-slate-950 dark:text-slate-100">{title}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {items.map((item) => (
                    <Link key={item.detailUrl} href={item.detailUrl} className="block px-4 py-3.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-slate-800/50 sm:px-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="break-all text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 sm:text-xs">{item.reference || 'Reference pending'}</div>
                                <div className="mt-1 break-words text-[12px] font-semibold leading-5 text-slate-950 dark:text-slate-100 sm:text-sm">{item.subject}</div>
                                <div className="mt-1 break-words text-xs leading-4 text-slate-500 dark:text-slate-400 sm:text-xs">
                                    {item.sender ? `${item.sender} · ` : ''}{item.currentOffice?.shortName || item.currentOffice?.name || 'Office pending'}
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-300 sm:text-xs">{humanize(item.lifecycle)}</div>
                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-xs">{formatDate(item[dateKey])}</div>
                            </div>
                        </div>
                    </Link>
                ))}
                {items.length === 0 ? <div className="px-5 py-7 text-center text-[13px] text-slate-500 dark:text-slate-400">No recent correspondence.</div> : null}
            </div>
        </div>
    );
}

export default function CorrespondenceOverview({ overview }: { overview: CorrespondenceOverviewData }) {
    return (
        <section className="space-y-3.5" aria-labelledby="dashboard-correspondence">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 sm:text-xs"><Inbox size={15} aria-hidden="true" /> Correspondence attention</div>
                    <h2 id="dashboard-correspondence" className="mt-1 text-base font-bold text-slate-950 dark:text-slate-100 sm:text-lg">Recent correspondence</h2>
                </div>
                <Link href="/correspondence" className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300 sm:text-xs">Open correspondence <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>

            <div className="grid gap-3 @min-[700px]:grid-cols-2">
                <CorrespondenceList title="Recently received" items={overview.recentlyReceived} dateKey="receivedAt" />
                <CorrespondenceList title="Recently routed" items={overview.recentlyRouted} dateKey="routedAt" />
            </div>
        </section>
    );
}

