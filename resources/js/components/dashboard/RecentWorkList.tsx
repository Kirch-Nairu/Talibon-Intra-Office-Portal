import { Link } from '@inertiajs/react';
import { Clock3 } from 'lucide-react';
import { dueTone, formatDate, humanize } from './format';
import type { DashboardWork } from './types';

type Props = {
    title: string;
    description: string;
    items: DashboardWork[];
    emptyMessage?: string;
};

export default function RecentWorkList({ title, description, items, emptyMessage = 'No authorized work in this view.' }: Props) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl" aria-label={title}>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
                <div>
                    <h2 className="text-sm font-bold text-slate-950 sm:text-base">{title}</h2>
                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">{description}</p>
                </div>
                <Clock3 size={16} className="text-slate-400" aria-hidden="true" />
            </div>
            <div className="divide-y divide-slate-100">
                {items.map((item) => (
                    <Link key={item.detailUrl} href={item.detailUrl} className="grid gap-2 px-4 py-3.5 hover:bg-slate-50 sm:px-5 md:grid-cols-[130px_1fr_160px_150px] md:items-center">
                        <div>
                            <div className="text-[9px] font-bold uppercase text-blue-700 sm:text-[10px]">{item.reference}</div>
                            <div className="mt-1 text-[8px] text-slate-400 sm:text-[9px]">{item.transactionType}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-[12px] font-semibold text-slate-950 sm:text-sm">{item.title}</div>
                            <div className="mt-1 text-[9px] text-slate-400 sm:text-[10px]">
                                {item.originOffice?.shortName || item.originOffice?.name || 'Unknown origin'} → {item.currentOffice?.shortName || item.currentOffice?.name || 'Unknown office'}
                            </div>
                        </div>
                        <div className="text-[9px] text-slate-500 sm:text-[10px]">
                            <div>{item.assignedEmployee?.name || 'Unassigned'}</div>
                            <div className="mt-1 text-slate-400">Updated {formatDate(item.updatedAt)}</div>
                        </div>
                        <div className="flex items-center justify-between gap-2 md:justify-end">
                            <span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase sm:text-[9px] ${dueTone[item.dueState]}`}>{humanize(item.dueState)}</span>
                            <span className="text-[8px] font-bold uppercase text-slate-400 sm:text-[9px]">{humanize(item.status)}</span>
                        </div>
                    </Link>
                ))}
                {items.length === 0 ? <div className="px-5 py-8 text-center text-[11px] text-slate-500">{emptyMessage}</div> : null}
            </div>
        </section>
    );
}
