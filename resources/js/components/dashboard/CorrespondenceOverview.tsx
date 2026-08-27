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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
                <h3 className="text-sm font-bold text-slate-950 sm:text-base">{title}</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {items.map((item) => (
                    <Link key={item.detailUrl} href={item.detailUrl} className="block px-4 py-3.5 hover:bg-slate-50 sm:px-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-[9px] font-bold uppercase tracking-wide text-blue-700 sm:text-[10px]">{item.reference || 'Reference pending'}</div>
                                <div className="mt-1 truncate text-[12px] font-semibold text-slate-950 sm:text-sm">{item.subject}</div>
                                <div className="mt-1 truncate text-[9px] text-slate-400 sm:text-[10px]">
                                    {item.sender ? `${item.sender} · ` : ''}{item.currentOffice?.shortName || item.currentOffice?.name || 'Office pending'}
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="text-[8px] font-bold uppercase text-slate-500 sm:text-[9px]">{humanize(item.lifecycle)}</div>
                                <div className="mt-1 text-[8px] text-slate-400 sm:text-[9px]">{formatDate(item[dateKey])}</div>
                            </div>
                        </div>
                    </Link>
                ))}
                {items.length === 0 ? <div className="px-5 py-8 text-center text-[11px] text-slate-500">No authorized correspondence in this view.</div> : null}
            </div>
        </div>
    );
}

export default function CorrespondenceOverview({ overview }: { overview: CorrespondenceOverviewData }) {
    return (
        <section className="space-y-4" aria-labelledby="dashboard-correspondence">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs"><Inbox size={15} aria-hidden="true" /> Authorized correspondence</div>
                    <h2 id="dashboard-correspondence" className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">Lifecycle attention and movement</h2>
                </div>
                <Link href="/correspondence" className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 sm:text-xs">Open workspace <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <Link href={overview.attention.link} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:col-span-2">
                    <div className="text-2xl font-bold text-amber-950">{overview.attention.value}</div>
                    <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-amber-800">{overview.attention.label}</div>
                </Link>
                {overview.status.map((item) => (
                    <Link key={item.lifecycle} href={item.link} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-blue-50">
                        <div className="text-xl font-bold text-slate-950">{item.count}</div>
                        <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">{item.label}</div>
                    </Link>
                ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <CorrespondenceList title="Recently Received" items={overview.recentlyReceived} dateKey="receivedAt" />
                <CorrespondenceList title="Recently Routed" items={overview.recentlyRouted} dateKey="routedAt" />
            </div>
        </section>
    );
}
