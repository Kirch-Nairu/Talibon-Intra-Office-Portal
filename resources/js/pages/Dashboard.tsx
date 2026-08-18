import { Link } from '@inertiajs/react';
import AppLayout from '../layouts/AppLayout';
import { AlertTriangle, ArrowRight, Bell, Building2, CheckCircle2, Clock3, FileText, ShieldCheck, UsersRound } from 'lucide-react';

type Stat = { label: string; value: number; tone: string };
type Recent = { id: number; ref: string; title: string; status: string; from: string };
type MunicipalOverview = {
    activeTransactions: number;
    executiveQueue: number;
    overdue: number;
    highPriority: number;
    completedThisMonth: number;
    workforce: number;
    offices: number;
};
type OfficeWorkload = { id: number; code: string; name: string; shortName?: string; employees: number; active: number; overdue: number; dueSoon: number };
type Props = {
    workspace: { kind: 'mayor' | 'department'; departmentName: string; departmentCode: string | null; canAccessHris: boolean; canManageLegislation: boolean; canSeeMunicipalOverview: boolean };
    stats: Stat[];
    recent: Recent[];
    departmentsCount: number;
    municipalOverview?: MunicipalOverview | null;
    departmentWorkload: OfficeWorkload[];
};

const toneClass: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-800 ring-blue-100',
    amber: 'bg-amber-50 text-amber-800 ring-amber-100',
    rose: 'bg-rose-50 text-rose-800 ring-rose-100',
    emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
};

export default function Dashboard({ workspace, stats, recent, departmentsCount, municipalOverview, departmentWorkload }: Props) {
    const isMayor = workspace.kind === 'mayor';
    const overviewCards = municipalOverview ? [
        ['Active Work', municipalOverview.activeTransactions],
        ['Executive Queue', municipalOverview.executiveQueue],
        ['Overdue', municipalOverview.overdue],
        ['High Priority', municipalOverview.highPriority],
        ['Completed This Month', municipalOverview.completedThisMonth],
        ['Municipal Workforce', municipalOverview.workforce],
    ] : [];

    return (
        <AppLayout title={isMayor ? "Mayor's Office Command Dashboard" : `${workspace.departmentName} Dashboard`}>
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-7">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 md:p-8 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
                        <div><div className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs sm:tracking-[0.2em]">{isMayor ? 'Municipal oversight' : 'Department workspace'}</div><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:mt-3 sm:text-3xl md:text-4xl">{workspace.departmentName}</h1><p className="mt-2 max-w-2xl text-[12px] leading-5 text-slate-600 sm:mt-3 sm:text-sm sm:leading-6">{isMayor ? 'Review municipal transactions, monitor department workload, identify bottlenecks, and act on items requiring executive attention.' : 'Receive, review, route, and track your office transactions from one accountable workspace.'}</p></div>
                        <div className="rounded-xl bg-[#0b2852] p-4 text-white sm:rounded-2xl sm:p-5"><div className="flex items-center gap-2 text-[12px] font-semibold sm:text-sm"><ShieldCheck size={16} className="sm:h-[18px] sm:w-[18px]" /> Authorized workspace</div><div className="mt-2 text-[11px] leading-5 text-blue-100 sm:mt-3 sm:text-sm">Access is scoped by employee identity, department, and role. Protected actions are enforced on the server.</div></div>
                    </div>
                </section>

                {municipalOverview && (
                    <>
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Municipal operations overview</div><h2 className="mt-1.5 text-xl font-bold text-slate-950 sm:text-2xl">Municipality-wide operational visibility</h2><p className="mt-1 text-[11px] text-slate-500 sm:text-sm">Workload, deadlines, executive attention, and workforce scale from the shared municipal database.</p></div><Link href="/employees" className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-[11px] font-semibold text-blue-800 sm:text-sm"><UsersRound size={15} /> View {municipalOverview.workforce} employees</Link></div>
                            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">{overviewCards.map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-3 sm:p-4"><div className="text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[10px]">{label}</div><div className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">{value}</div></div>)}</div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-5"><div><h2 className="text-sm font-bold text-slate-950 sm:text-base">Department workload & bottlenecks</h2><p className="mt-1 text-[10px] text-slate-500 sm:text-sm">Offices with overdue work rise to the top.</p></div><AlertTriangle size={18} className="text-amber-600" /></div>
                            <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Office</th><th className="px-5 py-3">Employees</th><th className="px-5 py-3">Active</th><th className="px-5 py-3">Due Soon</th><th className="px-5 py-3">Overdue</th></tr></thead><tbody className="divide-y divide-slate-100">{departmentWorkload.map((office) => <tr key={office.id}><td className="px-5 py-3.5"><div className="font-semibold text-slate-950">{office.shortName || office.name}</div><div className="mt-0.5 text-xs text-slate-400">{office.code}</div></td><td className="px-5 py-3.5 text-slate-700">{office.employees}</td><td className="px-5 py-3.5 font-semibold text-slate-900">{office.active}</td><td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${office.dueSoon ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>{office.dueSoon}</span></td><td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${office.overdue ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{office.overdue}</span></td></tr>)}</tbody></table></div>
                            <div className="divide-y divide-slate-100 md:hidden">{departmentWorkload.slice(0, 10).map((office) => <div key={office.id} className="p-3.5"><div className="flex items-start justify-between gap-3"><div><div className="text-[12px] font-semibold text-slate-950">{office.shortName || office.name}</div><div className="mt-0.5 text-[9px] text-slate-400">{office.employees} employees</div></div><div className="text-right"><div className="text-[11px] font-bold text-slate-950">{office.active} active</div><div className={`mt-1 text-[9px] font-semibold ${office.overdue ? 'text-rose-700' : 'text-emerald-700'}`}>{office.overdue} overdue · {office.dueSoon} due soon</div></div></div></div>)}</div>
                        </section>
                    </>
                )}

                <section className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5"><div className={`inline-flex rounded-md px-2 py-0.5 text-[9px] font-semibold ring-1 sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs ${toneClass[stat.tone]}`}>{stat.label}</div><div className="mt-2 text-xl font-bold text-slate-950 sm:mt-4 sm:text-3xl">{stat.value}</div></div>)}</section>

                <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.5fr_.75fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"><div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-5"><div><h2 className="text-sm font-bold text-slate-950 sm:text-base">{isMayor ? 'Priority review queue' : 'Recent transactions'}</h2><p className="mt-1 text-[10px] text-slate-500 sm:text-sm">Live from the shared municipal workflow database</p></div><Link href={isMayor ? '/mayor-office' : '/transactions'} className="shrink-0 text-[11px] font-semibold text-blue-700 sm:text-sm">Open inbox</Link></div><div className="divide-y divide-slate-100">{recent.map((item) => <Link key={item.id} href={`/transactions/${item.id}`} className="flex flex-col gap-2.5 px-4 py-3.5 transition hover:bg-blue-50/40 sm:gap-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="text-[10px] font-bold tracking-wide text-blue-700 sm:text-xs">{item.ref}</div><div className="mt-1 text-sm font-semibold text-slate-950 sm:text-base">{item.title}</div><div className="mt-1 text-[11px] text-slate-500 sm:text-sm">Origin: {item.from}</div></div><div className="flex items-center gap-2 sm:gap-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-700 sm:px-3 sm:py-1.5 sm:text-xs">{item.status}</span><span className="rounded-full border border-slate-200 p-1.5 text-slate-700 sm:p-2"><ArrowRight size={15} className="sm:h-[17px] sm:w-[17px]" /></span></div></Link>)}{recent.length === 0 && <div className="p-6 text-center text-[12px] text-slate-500 sm:p-8 sm:text-sm">No workflow activity is currently visible to this office.</div>}</div></div>
                    <div className="space-y-3 sm:space-y-6"><Link href="/memoranda" className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 sm:rounded-3xl sm:p-6"><div className="flex items-center gap-2.5 sm:gap-3"><div className="rounded-lg bg-blue-50 p-2 text-blue-800 sm:rounded-xl sm:p-2.5"><Bell size={18} className="sm:h-5 sm:w-5" /></div><div><div className="text-sm font-bold text-slate-950 sm:text-base">Municipal Memoranda</div><div className="text-[10px] text-slate-500 sm:text-xs">Delivery & acknowledgement</div></div></div><p className="mt-3 text-[11px] leading-5 text-slate-600 sm:mt-4 sm:text-sm sm:leading-6">Open issued memoranda, receive new notices, and acknowledge items addressed to your account.</p></Link><Link href="/departments" className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 sm:rounded-3xl sm:p-6"><div className="flex items-center gap-2.5 sm:gap-3"><Building2 className="text-blue-800" size={18} /><div className="text-sm font-bold text-slate-950 sm:text-base">Municipal Structure</div></div><div className="mt-3 text-2xl font-bold text-slate-950 sm:mt-4 sm:text-3xl">{departmentsCount}</div><div className="text-[11px] text-slate-500 sm:text-sm">configured prototype offices</div><div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:mt-5 sm:gap-3 sm:text-xs"><div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-800 sm:rounded-xl sm:p-3"><CheckCircle2 size={14} className="sm:h-4 sm:w-4" /><div className="mt-1.5 font-semibold sm:mt-2">Identity scoped</div></div><div className="rounded-lg bg-blue-50 p-2.5 text-blue-800 sm:rounded-xl sm:p-3"><Clock3 size={14} className="sm:h-4 sm:w-4" /><div className="mt-1.5 font-semibold sm:mt-2">Shared state</div></div></div></Link></div>
                </section>

                <section className="grid gap-2.5 sm:gap-4 md:grid-cols-3"><Link href="/legislation" className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-5"><FileText className="text-blue-800" size={18} /><div className="mt-3 text-sm font-bold text-slate-950 sm:mt-4 sm:text-base">Central Records</div><div className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-sm">Memoranda, ordinances, resolutions, and legislative issuances.</div></Link><Link href="/employees" className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-5"><UsersRound className="text-blue-800" size={18} /><div className="mt-3 text-sm font-bold text-slate-950 sm:mt-4 sm:text-base">Municipal Workforce</div><div className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-sm">Employee directory, office membership, and portal identity separation.</div></Link><div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-5"><ShieldCheck className="text-blue-800" size={18} /><div className="mt-3 text-sm font-bold text-slate-950 sm:mt-4 sm:text-base">Audit & Security</div><div className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-sm">Accountable actions, denied access, and workflow evidence.</div></div></section>
            </div>
        </AppLayout>
    );
}
