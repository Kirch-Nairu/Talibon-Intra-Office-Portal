import { Link, router } from '@inertiajs/react';
import { ArrowRight, Building2, CalendarDays, FileSearch, Search, UserRound, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';

type Office = {
    id?: number;
    code: string;
    name: string;
    shortName?: string | null;
};

type Employee = {
    name: string;
    position?: string | null;
};

type RecordRow = {
    recordType: 'correspondence' | 'transaction' | 'travel_order';
    reference?: string | null;
    title: string;
    source: string;
    originOffice?: Office | null;
    currentOffice?: Office | null;
    assignedEmployee?: Employee | null;
    state: string;
    classification?: string | null;
    recordDate?: string | null;
    updatedAt?: string | null;
    detailUrl: string;
};

type Paginator = {
    data: RecordRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};

type Option = {
    value: string;
    label: string;
};

type Filters = {
    search: string;
    record_type: string;
    state: string;
    office_id?: number | null;
    date_from: string;
    date_to: string;
};

type Props = {
    records: Paginator;
    filters: Filters;
    filterOptions: {
        recordTypes: Option[];
        states: Option[];
        offices: Office[];
    };
};

const humanize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value?: string | null) => {
    if (!value) return 'Not recorded';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'Not recorded'
        : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const recordTypeLabel = (recordType: RecordRow['recordType']) => {
    if (recordType === 'correspondence') return 'Correspondence';
    if (recordType === 'travel_order') return 'Travel Order';
    return 'Transaction';
};

const recordTypeClass = (recordType: RecordRow['recordType']) => {
    if (recordType === 'correspondence') return 'bg-blue-50 text-blue-800';
    if (recordType === 'travel_order') return 'bg-emerald-50 text-emerald-800';
    return 'bg-violet-50 text-violet-800';
};

export default function Index({ records, filters, filterOptions }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [recordType, setRecordType] = useState(filters.record_type || 'all');
    const [state, setState] = useState(filters.state);
    const [officeId, setOfficeId] = useState(filters.office_id ? String(filters.office_id) : '');
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    useEffect(() => {
        setSearch(filters.search);
        setRecordType(filters.record_type || 'all');
        setState(filters.state);
        setOfficeId(filters.office_id ? String(filters.office_id) : '');
        setDateFrom(filters.date_from);
        setDateTo(filters.date_to);
    }, [filters.search, filters.record_type, filters.state, filters.office_id, filters.date_from, filters.date_to]);

    const queryData = () => Object.fromEntries(
        Object.entries({
            search,
            record_type: recordType || 'all',
            state,
            office_id: officeId ? Number(officeId) : null,
            date_from: dateFrom,
            date_to: dateTo,
        }).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/records', queryData(), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setRecordType('all');
        setState('');
        setOfficeId('');
        setDateFrom('');
        setDateTo('');
        router.get('/records', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout title="Records">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <header>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Authorized records registry</div>
                    <h1 className="mt-1.5 text-2xl font-bold text-slate-950 sm:text-3xl">Records</h1>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-sm">
                        Search authorized correspondence, inter-office transactions, and approved Travel Orders.
                    </p>
                </header>

                <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
                    <label className="relative block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search reference, record, office, destination, sender, employee…"
                            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-[12px] outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 sm:text-sm"
                        />
                    </label>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.3fr_1fr_1fr_auto]">
                        <label>
                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Record Type</span>
                            <select
                                value={recordType}
                                onChange={(event) => {
                                    setRecordType(event.target.value);
                                    setState('');
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] sm:text-sm"
                            >
                                {filterOptions.recordTypes.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Status / Lifecycle</span>
                            <select
                                value={state}
                                onChange={(event) => setState(event.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] sm:text-sm"
                            >
                                <option value="">All states</option>
                                {filterOptions.states.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Current / Responsible Office</span>
                            <select
                                value={officeId}
                                onChange={(event) => setOfficeId(event.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] sm:text-sm"
                            >
                                <option value="">All authorized offices</option>
                                {filterOptions.offices.map((office) => (
                                    <option key={office.id} value={office.id}>{office.shortName || office.name}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">From</span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => setDateFrom(event.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[11px] sm:text-sm"
                            />
                        </label>

                        <label>
                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">To</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) => setDateTo(event.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[11px] sm:text-sm"
                            />
                        </label>

                        <div className="flex items-end gap-2">
                            <button className="flex-1 rounded-xl bg-[#0b2852] px-4 py-2.5 text-[11px] font-bold text-white sm:text-xs lg:flex-none">
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2.5 text-slate-500 hover:bg-slate-50"
                                aria-label="Clear records filters"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                </form>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800 sm:text-sm">
                            <FileSearch size={15} />
                            Records Registry
                        </div>
                        <div className="text-[9px] text-slate-400 sm:text-xs">
                            {records.total === 0 ? 'No matching records' : `Showing ${records.from || 1}–${records.to || records.data.length} of ${records.total}`}
                        </div>
                    </div>

                    <div className="hidden grid-cols-[110px_145px_minmax(220px,1.5fr)_170px_170px_130px_34px] gap-3 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 lg:grid">
                        <div>Type</div>
                        <div>Reference</div>
                        <div>Record</div>
                        <div>Current Office</div>
                        <div>Responsible</div>
                        <div>Date</div>
                        <div />
                    </div>

                    <div className="divide-y divide-slate-100">
                        {records.data.map((record) => (
                            <Link
                                key={`${record.recordType}:${record.detailUrl}`}
                                href={record.detailUrl}
                                className="grid gap-3 px-4 py-4 transition hover:bg-blue-50/40 sm:px-5 lg:grid-cols-[110px_145px_minmax(220px,1.5fr)_170px_170px_130px_34px] lg:items-center"
                            >
                                <div>
                                    <span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase sm:text-[9px] ${recordTypeClass(record.recordType)}`}>
                                        {recordTypeLabel(record.recordType)}
                                    </span>
                                </div>

                                <div className="min-w-0">
                                    <div className="truncate text-[10px] font-bold text-blue-700 sm:text-xs">{record.reference || 'Reference pending'}</div>
                                    <div className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">{humanize(record.state)}</div>
                                </div>

                                <div className="min-w-0">
                                    <div className="truncate text-[12px] font-semibold text-slate-950 sm:text-sm">{record.title}</div>
                                    <div className="mt-1 truncate text-[9px] text-slate-400 sm:text-[10px]">{record.source}</div>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {record.classification && (
                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase text-slate-600 sm:text-[9px]">
                                                {humanize(record.classification)}
                                            </span>
                                        )}
                                        {record.originOffice && (
                                            <span className="rounded-full bg-slate-50 px-2 py-1 text-[8px] text-slate-500 sm:text-[9px]">
                                                From {record.originOffice.shortName || record.originOffice.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-[10px] text-slate-600 sm:text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 size={12} className="text-slate-400" />
                                        {record.currentOffice?.shortName || record.currentOffice?.name || 'Not assigned'}
                                    </div>
                                </div>

                                <div className="text-[10px] text-slate-600 sm:text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <UserRound size={12} className="text-slate-400" />
                                        {record.recordType === 'travel_order'
                                            ? 'Issued personnel on detail'
                                            : (record.assignedEmployee?.name || 'Unassigned')}
                                    </div>
                                    {record.assignedEmployee?.position && <div className="mt-1 text-[9px] text-slate-400">{record.assignedEmployee.position}</div>}
                                </div>

                                <div className="text-[10px] font-medium text-slate-600 sm:text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays size={12} className="text-slate-400" />
                                        {formatDate(record.recordDate)}
                                    </div>
                                </div>

                                <ArrowRight className="hidden text-slate-300 lg:block" size={17} />
                            </Link>
                        ))}

                        {records.data.length === 0 && (
                            <div className="px-5 py-12 text-center">
                                <div className="text-sm font-semibold text-slate-700">No authorized records match this search.</div>
                                <div className="mt-1 text-xs text-slate-400">Change the filters or clear the search criteria.</div>
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
