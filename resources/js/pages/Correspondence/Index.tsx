import { Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Inbox, Search, UserRound, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import ProgressiveFilterBar from '../../components/filters/ProgressiveFilterBar';
import AppLayout from '../../layouts/AppLayout';

type Office = { id: number; code: string; name: string; short_name?: string | null };
type RecordOffice = { id: number; code: string; name: string; shortName?: string | null };
type Assignee = { id: number; employeeNumber: string; name?: string | null; position: string };
type CorrespondenceRow = {
    publicId: string;
    reference: string;
    sender: { name: string; organization?: string | null; source: string; channel?: string | null };
    subject: string;
    classification?: string | null;
    lifecycleState: string;
    currentOffice?: RecordOffice | null;
    assignedEmployee?: Assignee | null;
    workflowReference?: string | null;
    receivedAt?: string | null;
    age: string;
    actionRequired: boolean;
    overdue: boolean;
};
type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};
type Filters = {
    search?: string;
    lifecycle?: string;
    classification?: string;
    office_id?: number | string;
    assigned_to_me?: boolean | number | string;
    action_required?: boolean | number | string;
    aging?: string;
};
type Props = {
    records: Paginator<CorrespondenceRow>;
    filters: Filters;
    filterOptions: { lifecycles: string[]; classifications: string[]; offices: Office[] };
    workspace: { departmentName: string; departmentCode: string };
};

const humanize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const enabled = (value: Filters['assigned_to_me']) => value === true || value === 1 || value === '1';
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString() : 'Not recorded';

const lifecycleTone: Record<string, string> = {
    received: 'bg-blue-50 text-blue-800',
    registered: 'bg-slate-100 text-slate-700',
    classified: 'bg-violet-50 text-violet-800',
    routed: 'bg-amber-50 text-amber-800',
    in_action: 'bg-emerald-50 text-emerald-800',
};

export default function CorrespondenceIndex({ records, filters, filterOptions, workspace }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [lifecycle, setLifecycle] = useState(filters.lifecycle ?? '');
    const [classification, setClassification] = useState(filters.classification ?? '');
    const [officeId, setOfficeId] = useState(filters.office_id ? String(filters.office_id) : '');
    const [assignedToMe, setAssignedToMe] = useState(enabled(filters.assigned_to_me));
    const [actionRequired, setActionRequired] = useState(enabled(filters.action_required));
    const [aging, setAging] = useState(filters.aging ?? '');

    const apply = (event: FormEvent) => {
        event.preventDefault();
        router.get('/correspondence', {
            search: search || undefined,
            lifecycle: lifecycle || undefined,
            classification: classification || undefined,
            office_id: officeId || undefined,
            assigned_to_me: assignedToMe ? 1 : undefined,
            action_required: actionRequired ? 1 : undefined,
            aging: aging || undefined,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clear = () => {
        setSearch('');
        setLifecycle('');
        setClassification('');
        setOfficeId('');
        setAssignedToMe(false);
        setActionRequired(false);
        setAging('');
        router.get('/correspondence', {}, { replace: true });
    };

    const selectedOffice = filterOptions.offices.find((office) => String(office.id) === officeId);
    const activeFilters = [
        lifecycle ? `Lifecycle: ${humanize(lifecycle)}` : '',
        classification ? `Class: ${humanize(classification)}` : '',
        officeId ? `Office: ${selectedOffice?.short_name || selectedOffice?.name || officeId}` : '',
        aging ? 'Overdue workflow' : '',
        assignedToMe ? 'Assigned to me' : '',
        actionRequired ? 'Action required' : '',
    ].filter(Boolean);

    return (
        <AppLayout title="Correspondence">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs"><Inbox size={15} /> Intra-office correspondence</div>
                            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Correspondence Inbox</h1>
                            <p className="mt-2 max-w-3xl text-[12px] leading-5 text-slate-600 sm:text-sm sm:leading-6">Authorized correspondence visible to {workspace.departmentName}. Search, filtering, totals and pagination are enforced on the server before records reach this page.</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-500 sm:text-xs"><span className="font-semibold text-slate-800">{records.total}</span> visible record{records.total === 1 ? '' : 's'}</div>
                    </div>
                </section>

                <form onSubmit={apply}>
                    <ProgressiveFilterBar
                        title="Correspondence filters"
                        activeFilters={activeFilters}
                        primary={(
                            <label className="block">
                                <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Search correspondence</span>
                                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Reference, sender, subject…" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-[12px] text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 sm:text-sm" /></div>
                            </label>
                        )}
                        common={(
                            <>
                                <label className="block lg:min-w-44"><span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">Lifecycle</span><select value={lifecycle} onChange={(event) => setLifecycle(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[12px] text-slate-900 sm:text-sm"><option value="">All visible states</option>{filterOptions.lifecycles.map((state) => <option key={state} value={state}>{humanize(state)}</option>)}</select></label>
                                <label className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-semibold transition sm:text-xs ${assignedToMe ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700'}`}><input type="checkbox" checked={assignedToMe} onChange={(event) => setAssignedToMe(event.target.checked)} className="rounded border-slate-300" /> Assigned to me</label>
                                <label className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-semibold transition sm:text-xs ${actionRequired ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-300 bg-white text-slate-700'}`}><input type="checkbox" checked={actionRequired} onChange={(event) => setActionRequired(event.target.checked)} className="rounded border-slate-300" /> Action required</label>
                            </>
                        )}
                        advanced={(
                            <>
                                {filterOptions.classifications.length > 0 && <label className="block text-[10px] font-semibold text-slate-600 sm:text-xs">Classification<select value={classification} onChange={(event) => setClassification(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[12px] text-slate-900 sm:text-sm"><option value="">All authorized classifications</option>{filterOptions.classifications.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}</select></label>}
                                <label className="block text-[10px] font-semibold text-slate-600 sm:text-xs">Current office<select value={officeId} onChange={(event) => setOfficeId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[12px] text-slate-900 sm:text-sm"><option value="">All visible offices</option>{filterOptions.offices.map((office) => <option key={office.id} value={office.id}>{office.short_name || office.name}</option>)}</select></label>
                                <label className="block text-[10px] font-semibold text-slate-600 sm:text-xs">Aging<select value={aging} onChange={(event) => setAging(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[12px] text-slate-900 sm:text-sm"><option value="">All</option><option value="overdue">Overdue workflow only</option></select></label>
                            </>
                        )}
                        actions={(
                            <>
                                <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-700 sm:text-xs"><X size={14} /> Clear</button>
                                <button className="rounded-xl bg-[#0b2852] px-4 py-2.5 text-[11px] font-semibold text-white sm:text-xs">Apply filters</button>
                            </>
                        )}
                    />
                </form>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="hidden grid-cols-[145px_1.25fr_155px_150px_155px_120px] gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-500 lg:grid">
                        <div>Reference</div><div>Sender / Subject</div><div>Current Office</div><div>Responsible</div><div>State</div><div>Received</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {records.data.map((record) => (
                            <div key={record.publicId} className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[145px_1.25fr_155px_150px_155px_120px] lg:items-center">
                                <div><div className="text-[10px] font-bold text-blue-700 sm:text-xs">{record.reference}</div>{record.workflowReference && <div className="mt-1 text-[8px] text-slate-400 sm:text-[9px]">{record.workflowReference}</div>}<Link href={`/correspondence/${record.publicId}/workspace`} className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 hover:text-blue-900 sm:text-[10px]">View <ArrowRight size={11} /></Link></div>
                                <div className="min-w-0"><div className="text-[11px] font-semibold text-slate-900 sm:text-sm">{record.sender.name}</div><div className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">{record.sender.organization || humanize(record.sender.source)}</div><div className="mt-1 truncate text-[12px] font-semibold text-slate-700 sm:text-sm">{record.subject}</div></div>
                                <div><div className="text-[9px] uppercase text-slate-400 lg:hidden">Current office</div><div className="mt-0.5 text-[11px] font-semibold text-slate-700 sm:text-xs">{record.currentOffice?.shortName || record.currentOffice?.name || 'Unregistered intake'}</div></div>
                                <div><div className="text-[9px] uppercase text-slate-400 lg:hidden">Responsible</div><div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-700 sm:text-xs"><UserRound size={13} /> {record.assignedEmployee?.name || 'Unassigned'}</div></div>
                                <div className="flex flex-wrap gap-1.5"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${lifecycleTone[record.lifecycleState] || 'bg-slate-100 text-slate-700'}`}>{humanize(record.lifecycleState)}</span>{record.classification && <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[9px] font-semibold text-slate-600">{humanize(record.classification)}</span>}{record.actionRequired && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-800">Action</span>}{record.overdue && <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-bold text-rose-700"><AlertTriangle size={10} /> Overdue</span>}</div>
                                <div><div className="text-[10px] text-slate-600 sm:text-xs">{formatDate(record.receivedAt)}</div><div className="mt-1 text-[9px] text-slate-400">{record.age} pending</div></div>
                            </div>
                        ))}
                        {records.data.length === 0 && <div className="px-5 py-12 text-center"><Inbox className="mx-auto text-slate-300" size={28} /><div className="mt-3 text-sm font-semibold text-slate-700">No correspondence matches this authorized view.</div><div className="mt-1 text-xs text-slate-400">Try changing the filters or search terms.</div></div>}
                    </div>
                </section>

                {records.last_page > 1 && <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-xs"><div>Showing {records.from ?? 0}–{records.to ?? 0} of {records.total} authorized records · page {records.current_page} of {records.last_page}</div><div className="flex gap-2"><button type="button" disabled={!records.prev_page_url} onClick={() => records.prev_page_url && router.visit(records.prev_page_url, { preserveScroll: true })} className="rounded-lg border px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button><button type="button" disabled={!records.next_page_url} onClick={() => records.next_page_url && router.visit(records.next_page_url, { preserveScroll: true })} className="rounded-lg border px-3 py-1.5 font-semibold disabled:opacity-40">Next</button></div></div>}
            </div>
        </AppLayout>
    );
}
