import { Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Building2, Clock3, Plus, Search, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';

type Office = { id: number; code: string; name: string; shortName?: string | null };
type Employee = { name: string; position?: string | null };
type WorkItem = {
    id: number;
    reference: string;
    title: string;
    transactionType: string;
    priority: string;
    status: string;
    originOffice?: Office | null;
    currentOffice?: Office | null;
    assignedEmployee?: Employee | null;
    receivedAt?: string | null;
    dueAt?: string | null;
    completedAt?: string | null;
    ageInOffice?: string | null;
    dueState: 'on_track' | 'due_soon' | 'overdue' | 'completed';
    requiresAction: boolean;
};
type Paginator = {
    data: WorkItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};
type QueueView = { key: string; label: string; count: number };
type Filters = {
    view: string;
    search: string;
    status: string;
    priority: string;
    office_id?: number | null;
};
type Props = {
    records: Paginator;
    filters: Filters;
    views: QueueView[];
    filterOptions: {
        statuses: string[];
        priorities: string[];
        offices: Office[];
    };
    workspace: {
        departmentName?: string | null;
        departmentCode?: string | null;
        canViewAll: boolean;
    };
};

const humanize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : 'Not set';

const dueTone: Record<WorkItem['dueState'], string> = {
    on_track: 'bg-slate-100 text-slate-700',
    due_soon: 'bg-amber-50 text-amber-800',
    overdue: 'bg-rose-50 text-rose-800',
    completed: 'bg-emerald-50 text-emerald-800',
};

const priorityTone: Record<string, string> = {
    normal: 'bg-slate-100 text-slate-700',
    high: 'bg-amber-50 text-amber-800',
    urgent: 'bg-rose-50 text-rose-800',
};

export default function Index({ records, filters, views, filterOptions, workspace }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [priority, setPriority] = useState(filters.priority);
    const [officeId, setOfficeId] = useState(filters.office_id ? String(filters.office_id) : '');

    useEffect(() => {
        setSearch(filters.search);
        setStatus(filters.status);
        setPriority(filters.priority);
        setOfficeId(filters.office_id ? String(filters.office_id) : '');
    }, [filters.search, filters.status, filters.priority, filters.office_id]);

    const queryData = (overrides: Partial<Filters> = {}) => {
        const next = {
            view: overrides.view ?? filters.view,
            search: overrides.search ?? search,
            status: overrides.status ?? status,
            priority: overrides.priority ?? priority,
            office_id: overrides.office_id ?? (officeId ? Number(officeId) : null),
        };

        return Object.fromEntries(
            Object.entries(next).filter(([, value]) => value !== '' && value !== null && value !== undefined),
        );
    };

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/transactions', queryData(), { preserveState: true, preserveScroll: true, replace: true });
    };

    const selectView = (view: string) => {
        router.get('/transactions', queryData({ view }), { preserveState: true, preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPriority('');
        setOfficeId('');
        router.get('/transactions', { view: filters.view }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout title="My Work">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Inter-office work queue</div>
                        <h1 className="mt-1.5 text-2xl font-bold text-slate-950 sm:text-3xl">My Work</h1>
                        <p className="mt-1.5 max-w-3xl text-[11px] leading-5 text-slate-500 sm:text-sm">
                            Current assignments, office workload, deadlines, outgoing requests, and recently completed transactions.
                        </p>
                        <div className="mt-2 text-[10px] font-medium text-slate-400 sm:text-xs">
                            {workspace.canViewAll ? 'Authorized municipality-wide visibility' : workspace.departmentName || workspace.departmentCode || 'Authorized office visibility'}
                        </div>
                    </div>
                    <Link href="/transactions/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2852] px-4 py-2.5 text-[11px] font-semibold text-white sm:py-3 sm:text-sm">
                        <Plus size={16} /> New transaction
                    </Link>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {views.map((view) => {
                            const active = view.key === filters.view;
                            return (
                                <button
                                    key={view.key}
                                    type="button"
                                    onClick={() => selectView(view.key)}
                                    className={`shrink-0 rounded-xl border px-3 py-2 text-left transition sm:px-3.5 ${active ? 'border-blue-800 bg-blue-50 text-blue-950' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="text-[10px] font-bold sm:text-xs">{view.label}</div>
                                    <div className={`mt-0.5 text-[9px] sm:text-[10px] ${active ? 'text-blue-700' : 'text-slate-400'}`}>{view.count} record{view.count === 1 ? '' : 's'}</div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <form onSubmit={applyFilters} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800 sm:text-sm"><SlidersHorizontal size={15} /> Queue filters</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.5fr)_1fr_1fr_1.2fr_auto]">
                        <label className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-[11px] sm:text-sm"
                                placeholder="Reference, title, office, assignee…"
                            />
                        </label>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] sm:text-sm">
                            <option value="">All statuses</option>
                            {filterOptions.statuses.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
                        </select>
                        <select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] sm:text-sm">
                            <option value="">All priorities</option>
                            {filterOptions.priorities.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
                        </select>
                        <select value={officeId} onChange={(event) => setOfficeId(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] sm:text-sm">
                            <option value="">All authorized current offices</option>
                            {filterOptions.offices.map((office) => <option key={office.id} value={office.id}>{office.shortName || office.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <button className="flex-1 rounded-xl bg-blue-900 px-3 py-2.5 text-[11px] font-bold text-white sm:text-xs lg:flex-none">Apply</button>
                            <button type="button" onClick={clearFilters} className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2.5 text-slate-500 hover:bg-slate-50" aria-label="Clear filters"><X size={15} /></button>
                        </div>
                    </div>
                </form>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="text-[11px] font-bold text-slate-800 sm:text-sm">{views.find((view) => view.key === filters.view)?.label || 'Work Queue'}</div>
                        <div className="text-[9px] text-slate-400 sm:text-xs">
                            {records.total === 0 ? 'No matching records' : `Showing ${records.from || 1}–${records.to || records.data.length} of ${records.total}`}
                        </div>
                    </div>

                    <div className="hidden grid-cols-[130px_minmax(220px,1.5fr)_150px_170px_140px_110px_36px] gap-3 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 lg:grid">
                        <div>Reference</div><div>Transaction</div><div>Current Office</div><div>Responsible</div><div>Due / Age</div><div>Status</div><div />
                    </div>

                    <div className="divide-y divide-slate-100">
                        {records.data.map((item) => (
                            <Link
                                key={item.id}
                                href={`/transactions/${item.id}`}
                                className="grid gap-3 px-4 py-4 transition hover:bg-blue-50/40 sm:px-5 lg:grid-cols-[130px_minmax(220px,1.5fr)_150px_170px_140px_110px_36px] lg:items-center"
                            >
                                <div>
                                    <div className="text-[10px] font-bold text-blue-700 sm:text-xs">{item.reference}</div>
                                    <div className="mt-1 text-[9px] text-slate-400">{humanize(item.transactionType)}</div>
                                </div>

                                <div className="min-w-0">
                                    <div className="truncate text-[12px] font-semibold text-slate-950 sm:text-sm">{item.title}</div>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        <span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase sm:text-[9px] ${priorityTone[item.priority] || priorityTone.normal}`}>{item.priority}</span>
                                        {item.requiresAction && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold uppercase text-blue-800 sm:text-[9px]"><UserRound size={10} /> Needs action</span>}
                                        {item.dueState === 'overdue' && <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[8px] font-bold uppercase text-rose-800 sm:text-[9px]"><AlertTriangle size={10} /> Overdue</span>}
                                    </div>
                                </div>

                                <div className="text-[10px] text-slate-600 sm:text-xs">
                                    <div className="flex items-center gap-1.5"><Building2 size={12} className="text-slate-400" /> {item.currentOffice?.shortName || item.currentOffice?.name || 'Unknown office'}</div>
                                    <div className="mt-1 text-[9px] text-slate-400">From {item.originOffice?.shortName || item.originOffice?.name || 'Unknown'}</div>
                                </div>

                                <div className="text-[10px] text-slate-600 sm:text-xs">
                                    <div className="font-semibold text-slate-700">{item.assignedEmployee?.name || 'Unassigned'}</div>
                                    {item.assignedEmployee?.position && <div className="mt-1 text-[9px] text-slate-400">{item.assignedEmployee.position}</div>}
                                </div>

                                <div className="text-[10px] sm:text-xs">
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-700"><Clock3 size={12} className="text-slate-400" /> {item.dueState === 'completed' ? formatDate(item.completedAt) : formatDate(item.dueAt)}</div>
                                    <div className="mt-1 text-[9px] text-slate-400">{item.dueState === 'completed' ? 'Completed' : item.ageInOffice ? `${item.ageInOffice} in office` : 'Age not recorded'}</div>
                                </div>

                                <div><span className={`rounded-full px-2.5 py-1.5 text-[9px] font-semibold sm:text-[10px] ${dueTone[item.dueState]}`}>{humanize(item.status)}</span></div>
                                <ArrowRight className="hidden text-slate-300 lg:block" size={17} />
                            </Link>
                        ))}

                        {records.data.length === 0 && (
                            <div className="px-5 py-12 text-center">
                                <div className="text-sm font-semibold text-slate-700">No matching work in this view.</div>
                                <div className="mt-1 text-xs text-slate-400">Change the queue view or clear one of the active filters.</div>
                            </div>
                        )}
                    </div>

                    {records.last_page > 1 && (
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5">
                            <Link
                                href={records.prev_page_url || '#'}
                                preserveScroll
                                className={`rounded-lg border px-3 py-2 text-[10px] font-semibold sm:text-xs ${records.prev_page_url ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'pointer-events-none border-slate-100 text-slate-300'}`}
                            >
                                Previous
                            </Link>
                            <div className="text-[9px] text-slate-400 sm:text-xs">Page {records.current_page} of {records.last_page}</div>
                            <Link
                                href={records.next_page_url || '#'}
                                preserveScroll
                                className={`rounded-lg border px-3 py-2 text-[10px] font-semibold sm:text-xs ${records.next_page_url ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'pointer-events-none border-slate-100 text-slate-300'}`}
                            >
                                Next
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
