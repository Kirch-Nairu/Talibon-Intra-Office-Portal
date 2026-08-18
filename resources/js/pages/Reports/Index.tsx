import { Link } from '@inertiajs/react';
import { AlertTriangle, Building2, Download, FileBarChart, Printer } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';

type Summary = {
    activeTransactions: number;
    overdueTransactions: number;
    completedThisMonth: number;
    offices: number;
    employees: number;
    memoranda: number;
    memoDelivered: number;
    memoAcknowledged: number;
    municipalRecords: number;
    leavePending: number;
    attendanceEvents: number;
    operations: number;
    operationsOverdue: number;
    payrollPeriod?: string | null;
    payrollEmployees: number;
    payrollNet: number;
};
type Workload = { code: string; office: string; employees: number; active: number; overdue: number };
type Aging = { id: number; reference: string; title: string; origin?: string; current?: string; responsible: string; status: string; due?: string | null; overdue: boolean; age: string };

type Props = {
    permissions: { executive: boolean; hr: boolean };
    summary: Summary;
    departmentWorkload: Workload[];
    transactionAging: Aging[];
    operationsByType: Record<string, number>;
    recordsByType: Record<string, number>;
};

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);

export default function ReportsIndex({ permissions, summary, departmentWorkload, transactionAging, operationsByType, recordsByType }: Props) {
    const ackRate = summary.memoDelivered > 0 ? Math.round((summary.memoAcknowledged / summary.memoDelivered) * 100) : 0;
    const exportCards = [
        ...(permissions.executive ? [
            ['Department Workload', 'department-workload'],
            ['Transaction Aging', 'transaction-aging'],
            ['Operations Monitoring', 'operations'],
        ] : []),
        ['Employee Directory', 'employee-directory'],
        ...(permissions.hr ? [['Payroll Summary', 'payroll-summary']] : []),
    ];

    return (
        <AppLayout title="Reports">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Executive reporting</div><h1 className="mt-1.5 text-2xl font-bold text-slate-950 sm:text-3xl">Municipal Reports & Operational Evidence</h1><p className="mt-1.5 max-w-3xl text-[11px] text-slate-500 sm:text-sm">Consolidated reporting from the same municipal workflow, workforce, records, HR, payroll, and operations data used by the portal.</p></div>
                        <button onClick={() => window.print()} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 sm:px-4 sm:py-2.5 sm:text-sm"><Printer size={15} /> Print report</button>
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4 xl:grid-cols-8">
                    {[
                        ['Active Work', summary.activeTransactions],
                        ['Overdue', summary.overdueTransactions],
                        ['Completed', summary.completedThisMonth],
                        ['Offices', summary.offices],
                        ['Employees', summary.employees],
                        ['Memoranda', summary.memoranda],
                        ['Records', summary.municipalRecords],
                        ['Operations', summary.operations],
                    ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4"><div className="text-[8px] font-bold uppercase tracking-wide text-slate-500 sm:text-[9px]">{label}</div><div className="mt-1.5 text-xl font-bold text-slate-950 sm:text-2xl">{value}</div></div>)}
                </section>

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-[9px] uppercase text-slate-400">Memo acknowledgement</div><div className="mt-2 text-2xl font-bold text-slate-950">{ackRate}%</div><div className="mt-1 text-[10px] text-slate-500">{summary.memoAcknowledged} of {summary.memoDelivered} deliveries acknowledged</div></div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-[9px] uppercase text-slate-400">Attendance evidence</div><div className="mt-2 text-2xl font-bold text-slate-950">{summary.attendanceEvents}</div><div className="mt-1 text-[10px] text-slate-500">synthetic imported biometric events</div></div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-[9px] uppercase text-slate-400">Pending leave</div><div className="mt-2 text-2xl font-bold text-slate-950">{summary.leavePending}</div><div className="mt-1 text-[10px] text-slate-500">requests awaiting HR action</div></div>
                    {permissions.hr ? <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-[9px] uppercase text-slate-400">{summary.payrollPeriod || 'Payroll period'}</div><div className="mt-2 text-lg font-bold text-slate-950 sm:text-xl">{money(summary.payrollNet)}</div><div className="mt-1 text-[10px] text-slate-500">net payroll across {summary.payrollEmployees} synthetic records</div></div> : <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-[9px] uppercase text-slate-400">Operations deadlines</div><div className="mt-2 text-2xl font-bold text-slate-950">{summary.operationsOverdue}</div><div className="mt-1 text-[10px] text-slate-500">overdue project, procurement, fund, or compliance items</div></div>}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
                    <div className="flex items-center gap-2"><Download size={17} className="text-blue-800" /><h2 className="text-sm font-bold text-slate-950 sm:text-base">Exportable reports</h2></div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{exportCards.map(([label, report]) => <a key={report} href={`/reports/export/${report}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-[10px] font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 sm:text-xs"><span>{label}</span><Download size={14} /></a>)}</div>
                    <p className="mt-2 text-[9px] text-slate-400 sm:text-[10px]">CSV exports are generated from the current database state and are permission-scoped. Print view is available from this page.</p>
                </section>

                <section className="grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                        <div className="border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4"><div className="flex items-center gap-2"><Building2 size={16} className="text-blue-800" /><h2 className="text-sm font-bold text-slate-950">Department workload</h2></div><p className="mt-1 text-[9px] text-slate-500 sm:text-xs">Overdue offices are surfaced first.</p></div>
                        <div className="divide-y divide-slate-100">{departmentWorkload.slice(0, 12).map((office) => <div key={office.code} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><div className="truncate text-[11px] font-semibold text-slate-900 sm:text-sm">{office.office}</div><div className="mt-0.5 text-[8px] text-slate-400 sm:text-[10px]">{office.employees} employees · {office.code}</div></div><div className="flex shrink-0 items-center gap-2 text-right"><div><div className="text-[11px] font-bold text-slate-950">{office.active}</div><div className="text-[8px] text-slate-400">active</div></div><div className={`rounded-lg px-2 py-1 ${office.overdue ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}><div className="text-[10px] font-bold">{office.overdue}</div><div className="text-[7px] uppercase">overdue</div></div></div></div>)}</div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                        <div className="border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4"><div className="flex items-center gap-2"><FileBarChart size={16} className="text-blue-800" /><h2 className="text-sm font-bold text-slate-950">Transaction aging</h2></div><p className="mt-1 text-[9px] text-slate-500 sm:text-xs">Current responsibility, deadline, and time in receiving office.</p></div>
                        <div className="divide-y divide-slate-100">{transactionAging.map((tx) => <Link key={tx.id} href={`/transactions/${tx.id}`} className="block px-4 py-3 transition hover:bg-slate-50"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[9px] font-bold text-blue-700 sm:text-[10px]">{tx.reference}</div><div className="mt-0.5 truncate text-[11px] font-semibold text-slate-950 sm:text-sm">{tx.title}</div><div className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">{tx.current} · {tx.responsible} · {tx.age}</div></div><div className="shrink-0 text-right">{tx.overdue ? <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[8px] font-bold uppercase text-rose-700"><AlertTriangle size={10} /> overdue</div> : <div className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold uppercase text-emerald-700">on track</div>}<div className="mt-1 text-[8px] text-slate-400">{tx.due ? new Date(tx.due).toLocaleDateString() : 'No due date'}</div></div></div></Link>)}</div>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-sm font-bold text-slate-950">Operational monitoring coverage</h2><div className="mt-3 grid grid-cols-2 gap-2">{Object.entries(operationsByType).map(([type, count]) => <div key={type} className="rounded-xl bg-slate-50 p-3"><div className="text-[9px] uppercase text-slate-400">{type.replaceAll('_', ' ')}</div><div className="mt-1 text-xl font-bold text-slate-950">{count}</div></div>)}</div>{permissions.executive && <Link href="/operations" className="mt-3 inline-block text-[10px] font-semibold text-blue-700 sm:text-xs">Open operations monitoring →</Link>}</div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-sm font-bold text-slate-950">Central records coverage</h2><div className="mt-3 grid grid-cols-2 gap-2">{Object.entries(recordsByType).map(([type, count]) => <div key={type} className="rounded-xl bg-slate-50 p-3"><div className="text-[9px] uppercase text-slate-400">{type.replaceAll('_', ' ')}</div><div className="mt-1 text-xl font-bold text-slate-950">{count}</div></div>)}</div><Link href="/legislation" className="mt-3 inline-block text-[10px] font-semibold text-blue-700 sm:text-xs">Open central records →</Link></div>
                </section>
            </div>
        </AppLayout>
    );
}
