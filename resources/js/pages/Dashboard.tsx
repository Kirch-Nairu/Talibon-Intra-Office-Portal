import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Building2,
    Clock3,
    FileSearch,
    Inbox,
    ListTodo,
    Route,
    UserRound,
} from 'lucide-react';
import { type ReactNode } from 'react';
import AppLayout from '../layouts/AppLayout';

type Metric = {
    label: string;
    value: number;
    link: string;
};

type Office = {
    code: string;
    name: string;
    shortName?: string | null;
};

type CorrespondenceStatus = {
    lifecycle: string;
    label: string;
    count: number;
    link: string;
};

type RecentCorrespondence = {
    reference?: string | null;
    subject: string;
    sender?: string;
    lifecycle: string;
    currentOffice?: Office | null;
    receivedAt?: string | null;
    routedAt?: string | null;
    detailUrl: string;
};

type RecentWork = {
    reference: string;
    title: string;
    transactionType: string;
    status: string;
    priority: string;
    originOffice?: Office | null;
    currentOffice?: Office | null;
    assignedEmployee?: {
        name: string;
        position?: string | null;
    } | null;
    dueState: 'on_track' | 'due_soon' | 'overdue' | 'completed';
    detailUrl: string;
};

type MunicipalOverview = {
    activeMunicipalWork: number;
    municipalOverdue: number;
    municipalUnassigned: number;
    dueSoon: number;
    executiveQueue: number;
    completedThisMonth: number;
};

type OfficeWorkload = {
    id: number;
    code: string;
    name: string;
    shortName?: string | null;
    active: number;
    unassigned: number;
    dueSoon: number;
    overdue: number;
};

type Props = {
    workspace: {
        departmentName: string;
        departmentCode?: string | null;
        canSeeMunicipalOverview: boolean;
    };
    departmentMetrics: {
        requiresMyAction: Metric;
        pendingInMyOffice: Metric;
        unassignedInMyOffice: Metric;
        overdue: Metric;
        waitingOnOtherOffices: Metric;
        dueSoon: Metric;
        completedThisMonth: Metric;
    };
    correspondenceAttention: Metric;
    correspondenceStatus: CorrespondenceStatus[];
    recentlyReceivedCorrespondence: RecentCorrespondence[];
    recentlyRoutedCorrespondence: RecentCorrespondence[];
    recentWork: RecentWork[];
    municipalOverview?: MunicipalOverview | null;
    departmentWorkload?: OfficeWorkload[];
};

const humanize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value?: string | null) => {
    if (!value) return 'Not recorded';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'Not recorded'
        : date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
};

const dueTone: Record<RecentWork['dueState'], string> = {
    on_track: 'bg-slate-100 text-slate-600',
    due_soon: 'bg-amber-50 text-amber-800',
    overdue: 'bg-rose-50 text-rose-800',
    completed: 'bg-emerald-50 text-emerald-800',
};

function MetricCard({ metric, icon }: { metric: Metric; icon: ReactNode }) {
    return (
        <Link
            href={metric.link}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30 sm:p-5"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="text-slate-400">{icon}</div>
                <ArrowRight size={14} className="text-slate-300" />
            </div>
            <div className="mt-4 text-2xl font-bold text-slate-950 sm:text-3xl">{metric.value}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">{metric.label}</div>
        </Link>
    );
}

export default function Dashboard({
    workspace,
    departmentMetrics,
    correspondenceAttention,
    correspondenceStatus,
    recentlyReceivedCorrespondence,
    recentlyRoutedCorrespondence,
    recentWork,
    municipalOverview,
    departmentWorkload = [],
}: Props) {
    const municipalCards = municipalOverview ? [
        ['Active Municipal Work', municipalOverview.activeMunicipalWork],
        ['Municipal Overdue', municipalOverview.municipalOverdue],
        ['Municipal Unassigned', municipalOverview.municipalUnassigned],
        ['Due Soon', municipalOverview.dueSoon],
        ['Executive Queue', municipalOverview.executiveQueue],
        ['Completed This Month', municipalOverview.completedThisMonth],
    ] : [];

    return (
        <AppLayout title="Dashboard">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Current intra-office operations</div>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{workspace.departmentName}</h1>
                    <p className="mt-2 max-w-3xl text-[11px] leading-5 text-slate-500 sm:text-sm">
                        Review work requiring attention, current office accountability, recent correspondence, and authorized municipal records.
                    </p>
                </header>

                <section>
                    <div className="mb-3 flex items-end justify-between gap-3">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Needs attention</div>
                            <h2 className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">Current responsibility</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
                        <MetricCard metric={departmentMetrics.requiresMyAction} icon={<UserRound size={18} />} />
                        <MetricCard metric={departmentMetrics.pendingInMyOffice} icon={<Building2 size={18} />} />
                        <MetricCard metric={departmentMetrics.overdue} icon={<AlertTriangle size={18} />} />
                        <MetricCard metric={departmentMetrics.waitingOnOtherOffices} icon={<Route size={18} />} />
                    </div>
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                        {[departmentMetrics.unassignedInMyOffice, departmentMetrics.dueSoon, departmentMetrics.completedThisMonth, correspondenceAttention].map((metric) => (
                            <Link key={metric.label} href={metric.link} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-[11px] shadow-sm hover:bg-slate-50 sm:text-sm">
                                <span className="font-semibold text-slate-600">{metric.label}</span>
                                <span className="text-base font-bold text-slate-950 sm:text-lg">{metric.value}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-3">
                    <Link href="/transactions" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50">
                        <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 sm:text-sm"><ListTodo size={16} /> Open My Work</span>
                        <ArrowRight size={14} className="text-slate-400" />
                    </Link>
                    <Link href="/correspondence" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50">
                        <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 sm:text-sm"><Inbox size={16} /> Open Correspondence</span>
                        <ArrowRight size={14} className="text-slate-400" />
                    </Link>
                    <Link href="/records" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50">
                        <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 sm:text-sm"><FileSearch size={16} /> Search Records</span>
                        <ArrowRight size={14} className="text-slate-400" />
                    </Link>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Correspondence status</div>
                            <h2 className="mt-1 text-base font-bold text-slate-950 sm:text-lg">Authorized lifecycle overview</h2>
                        </div>
                        <Link href="/correspondence" className="text-[10px] font-semibold text-blue-700 sm:text-xs">Open inbox</Link>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {correspondenceStatus.map((item) => (
                            <Link key={item.lifecycle} href={item.link} className="rounded-xl bg-slate-50 p-3 hover:bg-blue-50">
                                <div className="text-xl font-bold text-slate-950">{item.count}</div>
                                <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[10px]">{item.label}</div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                        <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
                            <h2 className="text-sm font-bold text-slate-950 sm:text-base">Recently Received Correspondence</h2>
                            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Latest authorized intake and correspondence movement.</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {recentlyReceivedCorrespondence.map((item) => (
                                <Link key={item.detailUrl} href={item.detailUrl} className="block px-4 py-3.5 hover:bg-slate-50 sm:px-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[9px] font-bold uppercase tracking-wide text-blue-700 sm:text-[10px]">{item.reference || 'Reference pending'}</div>
                                            <div className="mt-1 truncate text-[12px] font-semibold text-slate-950 sm:text-sm">{item.subject}</div>
                                            <div className="mt-1 truncate text-[9px] text-slate-400 sm:text-[10px]">{item.sender || 'Sender not recorded'} · {item.currentOffice?.shortName || item.currentOffice?.name || 'Office pending'}</div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-[8px] font-bold uppercase text-slate-500 sm:text-[9px]">{humanize(item.lifecycle)}</div>
                                            <div className="mt-1 text-[8px] text-slate-400 sm:text-[9px]">{formatDate(item.receivedAt)}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {recentlyReceivedCorrespondence.length === 0 && <div className="px-5 py-8 text-center text-[11px] text-slate-500">No visible correspondence received yet.</div>}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                        <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
                            <h2 className="text-sm font-bold text-slate-950 sm:text-base">Recently Routed Correspondence</h2>
                            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Latest authorized correspondence with recorded routing activity.</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {recentlyRoutedCorrespondence.map((item) => (
                                <Link key={item.detailUrl} href={item.detailUrl} className="block px-4 py-3.5 hover:bg-slate-50 sm:px-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[9px] font-bold uppercase tracking-wide text-blue-700 sm:text-[10px]">{item.reference || 'Reference pending'}</div>
                                            <div className="mt-1 truncate text-[12px] font-semibold text-slate-950 sm:text-sm">{item.subject}</div>
                                            <div className="mt-1 text-[9px] text-slate-400 sm:text-[10px]">{item.currentOffice?.shortName || item.currentOffice?.name || 'Office pending'}</div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-[8px] font-bold uppercase text-slate-500 sm:text-[9px]">{humanize(item.lifecycle)}</div>
                                            <div className="mt-1 text-[8px] text-slate-400 sm:text-[9px]">{formatDate(item.routedAt)}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {recentlyRoutedCorrespondence.length === 0 && <div className="px-5 py-8 text-center text-[11px] text-slate-500">No visible routed correspondence yet.</div>}
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
                        <div>
                            <h2 className="text-sm font-bold text-slate-950 sm:text-base">Recent Work</h2>
                            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Latest transactions inside your authorized work visibility.</p>
                        </div>
                        <Link href="/transactions" className="text-[10px] font-semibold text-blue-700 sm:text-xs">Open My Work</Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentWork.map((item) => (
                            <Link key={item.detailUrl} href={item.detailUrl} className="grid gap-2 px-4 py-3.5 hover:bg-slate-50 sm:px-5 md:grid-cols-[130px_1fr_160px_150px] md:items-center">
                                <div>
                                    <div className="text-[9px] font-bold uppercase text-blue-700 sm:text-[10px]">{item.reference}</div>
                                    <div className="mt-1 text-[8px] text-slate-400 sm:text-[9px]">{item.transactionType}</div>
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-[12px] font-semibold text-slate-950 sm:text-sm">{item.title}</div>
                                    <div className="mt-1 text-[9px] text-slate-400 sm:text-[10px]">{item.originOffice?.shortName || item.originOffice?.name || 'Unknown origin'} → {item.currentOffice?.shortName || item.currentOffice?.name || 'Unknown office'}</div>
                                </div>
                                <div className="text-[9px] text-slate-500 sm:text-[10px]">{item.assignedEmployee?.name || 'Unassigned'}</div>
                                <div className="flex items-center justify-between gap-2 md:justify-end">
                                    <span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase sm:text-[9px] ${dueTone[item.dueState]}`}>{humanize(item.dueState)}</span>
                                    <span className="text-[8px] font-bold uppercase text-slate-400 sm:text-[9px]">{humanize(item.status)}</span>
                                </div>
                            </Link>
                        ))}
                        {recentWork.length === 0 && <div className="px-5 py-8 text-center text-[11px] text-slate-500">No recent authorized work.</div>}
                    </div>
                </section>

                {workspace.canSeeMunicipalOverview && municipalOverview && (
                    <>
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Municipality-wide transaction oversight</div>
                            <h2 className="mt-1 text-base font-bold text-slate-950 sm:text-lg">Executive workload</h2>
                            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Transaction oversight only. Correspondence remains independently authorization-scoped.</p>
                            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                                {municipalCards.map(([label, value]) => (
                                    <div key={String(label)} className="rounded-xl bg-slate-50 p-3">
                                        <div className="text-lg font-bold text-slate-950 sm:text-xl">{value}</div>
                                        <div className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-500 sm:text-[9px]">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-950 sm:text-base">Office Workload & Bottlenecks</h2>
                                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Active transaction accountability grouped by current responsible office.</p>
                                </div>
                                <Clock3 size={16} className="text-slate-400" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3">Office</th>
                                            <th className="px-4 py-3">Active</th>
                                            <th className="px-4 py-3">Unassigned</th>
                                            <th className="px-4 py-3">Due Soon</th>
                                            <th className="px-4 py-3">Overdue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-[10px] text-slate-600 sm:text-xs">
                                        {departmentWorkload.slice(0, 12).map((office) => (
                                            <tr key={office.id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-slate-950">{office.shortName || office.name}</div>
                                                    <div className="mt-0.5 text-[9px] text-slate-400">{office.code}</div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold">{office.active}</td>
                                                <td className="px-4 py-3">{office.unassigned}</td>
                                                <td className="px-4 py-3">{office.dueSoon}</td>
                                                <td className={`px-4 py-3 font-semibold ${office.overdue ? 'text-rose-700' : 'text-slate-600'}`}>{office.overdue}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
