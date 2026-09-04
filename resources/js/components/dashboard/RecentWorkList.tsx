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

export default function RecentWorkList({ title, description, items, emptyMessage = 'No work currently requires attention in this view.' }: Props) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-[#142236]" aria-label={title}>
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700 sm:px-5">
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-950 dark:text-slate-100 sm:text-base">{title}</h2>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400 sm:text-xs sm:leading-5">{description}</p>
                </div>
                <Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {items.map((item) => (
                    <Link
                        key={item.detailUrl}
                        href={item.detailUrl}
                        className="grid min-w-0 gap-2.5 px-4 py-3.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-slate-800/50 sm:px-5 md:grid-cols-[130px_minmax(0,1fr)_160px_150px] md:items-center"
                    >
                        <div className="min-w-0">
                            <div className="break-all text-[9px] font-bold uppercase text-blue-700 dark:text-blue-300 sm:text-[10px]">{item.reference}</div>
                            <div className="mt-0.5 break-words text-[8px] text-slate-400 sm:text-[9px]">{item.transactionType}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="break-words text-[12px] font-semibold leading-5 text-slate-950 dark:text-slate-100 sm:text-sm">{item.title}</div>
                            <div className="mt-1 break-words text-[9px] leading-4 text-slate-400 sm:text-[10px]">
                                {item.originOffice?.shortName || item.originOffice?.name || 'Unknown origin'} → {item.currentOffice?.shortName || item.currentOffice?.name || 'Unknown office'}
                            </div>
                        </div>
                        <div className="text-[9px] leading-4 text-slate-500 dark:text-slate-400 sm:text-[10px]">
                            <div className="break-words">{item.assignedEmployee?.name || 'Unassigned'}</div>
                            <div className="mt-0.5 text-slate-400">Updated {formatDate(item.updatedAt)}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase sm:text-[9px] ${dueTone[item.dueState]}`}>{humanize(item.dueState)}</span>
                            <span className="text-[8px] font-bold uppercase text-slate-400 sm:text-[9px]">{humanize(item.status)}</span>
                        </div>
                    </Link>
                ))}
                {items.length === 0 ? <div className="px-5 py-7 text-center text-[11px] text-slate-500 dark:text-slate-400">{emptyMessage}</div> : null}
            </div>
        </section>
    );
}
