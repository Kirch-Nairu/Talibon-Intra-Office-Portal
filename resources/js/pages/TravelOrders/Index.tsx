import { Link, router } from '@inertiajs/react';
import { ArrowRight, CalendarDays, FileCheck2, MapPin, Plus, Search, Users, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import ProgressiveFilterBar from '../../components/filters/ProgressiveFilterBar';
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
const officeLabel = (office?: Office | null) => office?.shortName || office?.name || 'Office not recorded';

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

    const selectedStatus = filterOptions.statuses.find((option) => option.value === status);
    const selectedOffice = filterOptions.offices.find((office) => String(office.id) === officeId);
    const activeFilters = [
        status ? `Status: ${selectedStatus?.label || humanize(status)}` : '',
        officeId ? `Office: ${selectedOffice?.shortName || selectedOffice?.name || officeId}` : '',
        dateFrom ? `From: ${dateFrom}` : '',
        dateTo ? `To: ${dateTo}` : '',
    ].filter(Boolean);

    return (
        <AppLayout title="Approved Travel Orders">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Official post-approval registry</div>
                        <h1 className="mt-1.5 text-2xl font-bold text-slate-950 sm:text-3xl">Approved Travel Orders</h1>
                        <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-sm">
                            Locate official approved travel records you are authorized to see. Requests, bookings, liquidation, and reimbursement remain outside this registry.
                        </p>
                    </div>
                    {canRecordApproved && (
                        <Link href="/travel-orders/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2852] px-4 py-2.5 text-[11px] font-bold text-white sm:text-xs">
                            <Plus size={15} /> Record approved order
                        </Link>
                    )}
                </header>

                <form onSubmit={submit}>
                    <ProgressiveFilterBar
                        title="Travel Order filters"
                        activeFilters={activeFilters}
                        primary={(
                            <label className="block">
                                <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Search approved orders</span>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, purpose, destination, office, employee…" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-[12px] text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 sm:text-sm" />
                                </div>
                            </label>
                        )}
                        common={(
                            <label className="block lg:min-w-44"><span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] text-slate-900 sm:text-sm"><option value="">All statuses</option>{filterOptions.statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                        )}
                        advanced={(
                            <>
                                <label><span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Responsible office</span><select value={officeId} onChange={(event) => setOfficeId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] text-slate-900 sm:text-sm"><option value="">All authorized offices</option>{filterOptions.offices.map((office) => <option key={office.id} value={office.id}>{office.shortName || office.name}</option>)}</select></label>
                                <label><span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Travel from</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] text-slate-900 sm:text-sm" /></label>
                                <label><span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Travel to</span><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] text-slate-900 sm:text-sm" /></label>
                            </>
                        )}
                        actions={(
                            <>
                                <button className="rounded-xl bg-[#0b2852] px-4 py-2.5 text-[11px] font-bold text-white sm:text-xs">Apply</button>
                                <button type="button" onClick={clear} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-500 hover:bg-slate-50" aria-label="Clear Travel Order filters"><X size={15} /></button>
                            </>
                        )}
                    />
                </form>

                <section aria-label="Approved travel order registry" className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800 sm:text-sm"><FileCheck2 size={15} /> Approved-order registry</div>
                        <div className="text-[9px] text-slate-500 sm:text-xs">{travelOrders.total === 0 ? 'No matching orders' : `Showing ${travelOrders.from || 1}–${travelOrders.to || travelOrders.data.length} of ${travelOrders.total}`}</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {travelOrders.data.map((order) => (
                            <article key={order.publicId} className="px-4 py-4 sm:px-5">
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(460px,1fr)_auto] lg:items-start">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link href={order.detailUrl} className="text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700 hover:underline sm:text-xs">{order.referenceNumber}</Link>
                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-slate-600 sm:text-[9px]">{humanize(order.status)}</span>
                                        </div>
                                        <h2 className="mt-1.5 break-words text-[13px] font-semibold leading-5 text-slate-950 sm:text-sm">{order.purpose}</h2>
                                        <div className="mt-2 inline-flex max-w-full items-start gap-1.5 text-[10px] font-medium text-slate-600 sm:text-xs"><MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" /><span className="break-words">{order.destination}</span></div>
                                    </div>

                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                                        <div className="min-w-0">
                                            <dt className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">Travel period</dt>
                                            <dd className="mt-1 flex items-start gap-1.5 break-words text-[10px] font-semibold text-slate-700 sm:text-xs"><CalendarDays size={12} className="mt-0.5 shrink-0 text-slate-400" />{order.travelStartDate} — {order.travelEndDate}</dd>
                                        </div>
                                        <div className="min-w-0">
                                            <dt className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">Responsible office</dt>
                                            <dd className="mt-1 break-words text-[10px] font-semibold text-slate-700 sm:text-xs">{officeLabel(order.office)}</dd>
                                        </div>
                                        <div className="min-w-0">
                                            <dt className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">Personnel issued</dt>
                                            <dd className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 sm:text-xs"><Users size={12} className="shrink-0 text-slate-400" />{order.issuedToCount} {order.issuedToCount === 1 ? 'person' : 'personnel'}</dd>
                                        </div>
                                        <div className="min-w-0">
                                            <dt className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">Issued</dt>
                                            <dd className="mt-1 text-[10px] font-semibold text-slate-700 sm:text-xs">{order.issuanceDate}</dd>
                                        </div>
                                    </dl>

                                    <Link href={order.detailUrl} aria-label={`Open travel order ${order.referenceNumber}`} className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 sm:text-xs lg:justify-self-end">
                                        Open order <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                        {travelOrders.data.length === 0 && <div className="px-5 py-12 text-center"><div className="text-sm font-semibold text-slate-700">No authorized approved Travel Orders match this search.</div><div className="mt-1 text-xs text-slate-500">Change the filters or clear the search criteria.</div></div>}
                    </div>
                    {travelOrders.last_page > 1 && <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5"><Link href={travelOrders.prev_page_url || '#'} preserveScroll className={`rounded-lg border px-3 py-2 text-[10px] font-semibold sm:text-xs ${travelOrders.prev_page_url ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'pointer-events-none border-slate-100 text-slate-300'}`}>Previous</Link><div className="text-[9px] text-slate-500 sm:text-xs">Page {travelOrders.current_page} of {travelOrders.last_page}</div><Link href={travelOrders.next_page_url || '#'} preserveScroll className={`rounded-lg border px-3 py-2 text-[10px] font-semibold sm:text-xs ${travelOrders.next_page_url ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'pointer-events-none border-slate-100 text-slate-300'}`}>Next</Link></div>}
                </section>
            </div>
        </AppLayout>
    );
}
