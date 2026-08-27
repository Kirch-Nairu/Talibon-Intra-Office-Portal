import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Building2, Clock3, UserRound } from 'lucide-react';
import type { Paginator } from './types';

const humanize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value?: string | null) => {
    if (!value) return 'Not set';
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString();
};

const dueTone = {
    on_track: 'bg-slate-100 text-slate-700',
    due_soon: 'bg-amber-50 text-amber-800',
    overdue: 'bg-rose-50 text-rose-800',
    completed: 'bg-emerald-50 text-emerald-800',
} as const;

const priorityTone: Record<string, string> = {
    normal: 'bg-slate-100 text-slate-700',
    high: 'bg-amber-50 text-amber-800',
    urgent: 'bg-rose-50 text-rose-800',
};

export default function WorkItemList({ records, title }: { records: Paginator; title: string }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl" aria-label={title}>
            <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="text-[11px] font-bold text-slate-800 sm:text-sm">{title}</div>
                <div className="text-[9px] text-slate-400 sm:text-xs">
                    {records.total === 0 ? 'No matching items' : `Showing ${records.from || 1}–${records.to || records.data.length} of ${records.total}`}
                </div>
            </div>

            <div className="hidden grid-cols-[120px_minmax(190px,1.2fr)_145px_145px_145px_minmax(180px,1fr)_28px] gap-3 border-b border-slate-100 px-5 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400 xl:grid">
                <div>Reference / Type</div><div>Work / Status</div><div>From / Current</div><div>Assignment</div><div>Due / Updated</div><div>Expected action</div><div />
            </div>

            <div className="divide-y divide-slate-100">
                {records.data.map((item) => (
                    <Link
                        key={item.id}
                        href={`/transactions/${item.id}`}
                        className="grid gap-3 px-4 py-4 transition hover:bg-blue-50/40 sm:px-5 xl:grid-cols-[120px_minmax(190px,1.2fr)_145px_145px_145px_minmax(180px,1fr)_28px] xl:items-center"
                    >
                        <div>
                            <div className="text-[10px] font-bold text-blue-700 sm:text-xs">{item.reference}</div>
                            <div className="mt-1 text-[9px] text-slate-400">{humanize(item.transactionType)}</div>
                        </div>

                        <div className="min-w-0">
                            <div className="truncate text-[12px] font-semibold text-slate-950 sm:text-sm">{item.title}</div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                <span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase sm:text-[9px] ${priorityTone[item.priority] || priorityTone.normal}`}>{item.priority}</span>
                                <span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase sm:text-[9px] ${dueTone[item.dueState]}`}>{humanize(item.status)}</span>
                                {item.requiresAction ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold uppercase text-blue-800 sm:text-[9px]"><UserRound size={10} aria-hidden="true" /> Needs action</span> : null}
                                {item.dueState === 'overdue' ? <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[8px] font-bold uppercase text-rose-800 sm:text-[9px]"><AlertTriangle size={10} aria-hidden="true" /> Overdue</span> : null}
                            </div>
                        </div>

                        <div className="text-[10px] text-slate-600 sm:text-xs">
                            <div className="text-[9px] text-slate-400">From {item.originOffice?.shortName || item.originOffice?.name || 'Unknown'}</div>
                            <div className="mt-1 flex items-center gap-1.5"><Building2 size={12} className="text-slate-400" aria-hidden="true" /> {item.currentOffice?.shortName || item.currentOffice?.name || 'Unknown office'}</div>
                        </div>

                        <div className="text-[10px] text-slate-600 sm:text-xs">
                            <div className="font-semibold text-slate-700">{item.assignedEmployee?.name || 'Unassigned'}</div>
                            {item.assignedEmployee?.position ? <div className="mt-1 text-[9px] text-slate-400">{item.assignedEmployee.position}</div> : null}
                        </div>

                        <div className="text-[10px] sm:text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700"><Clock3 size={12} className="text-slate-400" aria-hidden="true" /> {item.dueState === 'completed' ? formatDate(item.completedAt) : formatDate(item.dueAt)}</div>
                            <div className="mt-1 text-[9px] text-slate-400">Updated {formatDate(item.updatedAt)}</div>
                        </div>

                        <div className="rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold leading-4 text-slate-700 sm:text-xs">{item.expectedAction}</div>
                        <ArrowRight className="hidden text-slate-300 xl:block" size={16} aria-hidden="true" />
                    </Link>
                ))}

                {records.data.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <div className="text-sm font-semibold text-slate-700">No matching work in this view.</div>
                        <div className="mt-1 text-xs text-slate-400">Change the queue category or clear one of the active filters.</div>
                    </div>
                ) : null}
            </div>

            {records.last_page > 1 ? (
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5">
                    <Link href={records.prev_page_url || '#'} preserveScroll className={`rounded-lg border px-3 py-2 text-[10px] font-semibold sm:text-xs ${records.prev_page_url ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'pointer-events-none border-slate-100 text-slate-300'}`}>Previous</Link>
                    <div className="text-[9px] text-slate-400 sm:text-xs">Page {records.current_page} of {records.last_page}</div>
                    <Link href={records.next_page_url || '#'} preserveScroll className={`rounded-lg border px-3 py-2 text-[10px] font-semibold sm:text-xs ${records.next_page_url ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'pointer-events-none border-slate-100 text-slate-300'}`}>Next</Link>
                </div>
            ) : null}
        </section>
    );
}
