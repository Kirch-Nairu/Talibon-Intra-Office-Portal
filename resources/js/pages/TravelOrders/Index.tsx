import { Link, router } from '@inertiajs/react';
import { CalendarDays, FileCheck2, MapPin, Plus, Search, Users, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';

type Office = { id?: number; code: string; name: string; shortName?: string | null };
type Option = { value: string; label: string };
type TravelOrderRow = {
    publicId: string;
    referenceNumber: string;
    issuanceDate: string;
    purpose: string;
    destination: string;
    office?: Office | null;
    travelStartDate: string;
    travelEndDate: string;
    status: string;
    issuedToCount: number;
    detailUrl: string;
};
type Paginator = {
    data: TravelOrderRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};
type Filters = { search: string; status: string; office_id?: number | null; date_from: string; date_to: string };
type Props = {
    travelOrders: Paginator;
    filters: Filters;
    filterOptions: { statuses: Option[]; offices: Office[] };
    canRecordApproved: boolean;
};

const humanize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function Index({ travelOrders, filters, filterOptions, canRecordApproved }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [officeId, setOfficeId] = useState(filters.office_id ? String(filters.office_id) : '');
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    useEffect(() => {
        setSearch(filters.search);
        setStatus(filters.status);
        setOfficeId(filters.office_id ? String(filters.office_id) : '');
        setDateFrom(filters.date_from);
        setDateTo(filters.date_to);
    }, [filters.search, filters.status, filters.office_id, filters.date_from, filters.date_to]);

    const queryData = () => Object.fromEntries(Object.entries({
        search,
        status,
        office_id: officeId ? Number(officeId) : null,
        date_from: dateFrom,
        date_to: dateTo,
    }).filter(([, value]) => value !== '' && value !== null));

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/travel-orders', queryData(), { preserveState: true, preserveScroll: true, replace: true });
    };

    const clear = () => {
        setSearch(''); setStatus(''); setOfficeId(''); setDateFrom(''); setDateTo('');
        router.get('/travel-orders', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout title="Approved Travel Orders">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Core Portal · post-approval records</div>
                        <h1 className="mt-1.5 text-2xl font-bold text-slate-950 sm:text-3xl">Approved Travel Orders</h1>
                        <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-sm">
                            Locate official approved travel records you are authorized to see. This workspace does not manage requests, bookings, liquidation, or reimbursement.
                        </p>
                    </div>
                    {canRecordApproved && (
                        <Link href="/travel-orders/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2852] px-4 py-2.5 text-[11px] font-bold text-white sm:text-xs">
                            <Plus size={15} /> Record approved order
                        </Link>
                    )}
                </header>

                <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
                    <label className="relative block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, purpose, destination, office, employee…" className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-[12px] outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 sm:text-sm" />
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.4fr_1fr_1fr_auto]">
                        <label><span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] sm:text-sm"><option value="">All statuses</option>{filterOptions.statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                        <label><span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Responsible office</span><select value={officeId} onChange={(event) => setOfficeId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] sm:text-sm"><option value="">All authorized offices</option>{filterOptions.offices.map((office) => <option key={office.id} value={office.id}>{office.shortName || office.name}</option>)}</select></label>
                        <label><span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Travel from</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[11px] sm:text-sm" /></label>
                        <label><span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Travel to</span><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[11px] sm:text-sm" /></label>
                        <div className="flex items-end gap-2"><button className="flex-1 rounded-xl bg-[#0b2852] px-4 py-2.5 text-[11px] font-bold text-white sm:text-xs lg:flex-none">Apply</button><button type="button" onClick={clear} className="rounded-xl border border-slate-300 px-3 py-2.5 text-slate-500 hover:bg-slate-50" aria-label="Clear Travel Order filters"><X size={15} /></button></div>
                    </div>
                </form>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5"><div className="flex items-center gap-2 text-[11px] font-bold text-slate-800 sm:text-sm"><FileCheck2 size={15} /> Approved-order registry</div><div className="text-[9px] text-slate-400 sm:text-xs">{travelOrders.total === 0 ? 'No matching orders' : `Showing ${travelOrders.from || 1}–${travelOrders.to || travelOrders.data.length} of ${travelOrders.total}`}</div></div>
                    <div className="divide-y divide-slate-100">
                        {travelOrders.data.map((order) => (
                            <Link key={order.publicId} href={order.detailUrl} className="block px-4 py-4 transition hover:bg-blue-50/40 sm:px-5">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold text-blue-700 sm:text-sm">{order.referenceNumber}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase text-slate-600 sm:text-[9px]">{humanize(order.status)}</span></div>
                                        <div className="mt-1.5 truncate text-[12px] font-semibold text-slate-950 sm:text-sm">{order.purpose}</div>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-500 sm:text-xs">
                                            <span className="inline-flex items-center gap-1"><MapPin size={12} /> {order.destination}</span>
                                            <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {order.travelStartDate} — {order.travelEndDate}</span>
                                            <span className="inline-flex items-center gap-1"><Users size={12} /> {order.issuedToCount} personnel</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-[10px] text-slate-500 sm:text-xs lg:text-right"><div className="font-semibold text-slate-700">{order.office?.shortName || order.office?.name || 'Office not recorded'}</div><div className="mt-1">Issued {order.issuanceDate}</div></div>
                                </div>
                            </Link>
                        ))}
                        {travelOrders.data.length === 0 && <div className="px-5 py-12 text-center"><div className="text-sm font-semibold text-slate-700">No authorized approved Travel Orders match this search.</div><div className="mt-1 text-xs text-slate-400">Change the filters or clear the search criteria.</div></div>}
                    </div>
                    {travelOrders.last_page > 1 && <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5"><Link href={travelOrders.prev_page_url || '#'} preserveScroll className={`rounded-lg border px-3 py-2 text-[10px] font-semibold sm:text-xs ${travelOrders.prev_page_url ? 'border-slate-300 text-slate-700' : 'pointer-events-none border-slate-100 text-slate-300'}`}>Previous</Link><div className="text-[9px] text-slate-400 sm:text-xs">Page {travelOrders.current_page} of {travelOrders.last_page}</div><Link href={travelOrders.next_page_url || '#'} preserveScroll className={`rounded-lg border px-3 py-2 text-[10px] font-semibold sm:text-xs ${travelOrders.next_page_url ? 'border-slate-300 text-slate-700' : 'pointer-events-none border-slate-100 text-slate-300'}`}>Next</Link></div>}
                </section>
            </div>
        </AppLayout>
    );
}
