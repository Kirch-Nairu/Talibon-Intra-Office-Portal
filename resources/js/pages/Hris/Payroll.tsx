import { Link } from '@inertiajs/react';
import { Banknote, CheckCircle2, Printer, UsersRound } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';

const money = (value?: string | number | null) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0));

type Period = { id: number; label: string; period_start: string; period_end: string; status: string; processed_at?: string; approved_at?: string; released_at?: string };
type Entry = { id: number; basic_pay: string; allowances: string; gross_pay: string; gsis: string; philhealth: string; pagibig: string; withholding_tax: string; other_deductions: string; total_deductions: string; net_pay: string; status: string; employee?: any };

type Props = {
    period?: Period | null;
    employee: any;
    entry?: Entry | null;
    canAdmin: boolean;
    adminSummary?: { employees: number; gross: number; deductions: number; net: number; released: number } | null;
    adminEntries: Entry[];
};

export default function Payroll({ period, employee, entry, canAdmin, adminSummary, adminEntries }: Props) {
    return (
        <AppLayout title="Payroll">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div><Link href="/hris" className="text-[11px] font-semibold text-blue-700 sm:text-sm">← Back to HRIS</Link><div className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Payroll prototype</div><h1 className="mt-1.5 text-2xl font-bold text-slate-950 sm:text-3xl">{period?.label || 'Payroll'}</h1><p className="mt-1 text-[11px] text-slate-500 sm:text-sm">Synthetic payroll records demonstrating employee access and HR-level period visibility.</p></div>
                    <button onClick={() => window.print()} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 sm:px-4 sm:py-2.5 sm:text-sm"><Printer size={15} /> Print view</button>
                </div>

                {period && (
                    <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4"><div className="text-[9px] uppercase text-slate-400 sm:text-[10px]">Period</div><div className="mt-1 text-[12px] font-semibold text-slate-900 sm:text-sm">{new Date(period.period_start).toLocaleDateString()} – {new Date(period.period_end).toLocaleDateString()}</div></div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4"><div className="text-[9px] uppercase text-slate-400 sm:text-[10px]">Status</div><div className="mt-1 text-[12px] font-bold uppercase text-emerald-700 sm:text-sm">{period.status}</div></div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4"><div className="text-[9px] uppercase text-slate-400 sm:text-[10px]">Employee</div><div className="mt-1 text-[12px] font-semibold text-slate-900 sm:text-sm">{employee.full_name || employee.employee_number}</div></div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4"><div className="text-[9px] uppercase text-slate-400 sm:text-[10px]">Office</div><div className="mt-1 text-[12px] font-semibold text-slate-900 sm:text-sm">{employee.department?.short_name || employee.department?.name}</div></div>
                    </section>
                )}

                {entry ? (
                    <section className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                            <div className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-5"><div className="flex items-center gap-2"><Banknote size={17} className="text-blue-800" /><h2 className="text-sm font-bold text-slate-950 sm:text-base">Compensation summary</h2></div></div>
                            <div className="p-4 sm:p-6"><div className="space-y-3 text-[12px] sm:text-sm"><div className="flex justify-between gap-4"><span className="text-slate-500">Basic compensation</span><strong>{money(entry.basic_pay)}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-500">Allowances</span><strong>{money(entry.allowances)}</strong></div><div className="flex justify-between gap-4 border-t border-slate-100 pt-3"><span className="font-semibold text-slate-800">Gross compensation</span><strong>{money(entry.gross_pay)}</strong></div></div><div className="mt-5 rounded-2xl bg-[#0b2852] p-4 text-white sm:p-5"><div className="text-[9px] uppercase tracking-wide text-blue-200 sm:text-[10px]">Net pay</div><div className="mt-1 text-2xl font-bold sm:text-3xl">{money(entry.net_pay)}</div><div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-emerald-200 sm:text-xs"><CheckCircle2 size={13} /> {entry.status.toUpperCase()}</div></div></div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"><h2 className="text-sm font-bold text-slate-950 sm:text-base">Deductions</h2><div className="mt-4 space-y-3 text-[11px] sm:text-sm"><div className="flex justify-between"><span className="text-slate-500">GSIS</span><strong>{money(entry.gsis)}</strong></div><div className="flex justify-between"><span className="text-slate-500">PhilHealth</span><strong>{money(entry.philhealth)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Pag-IBIG</span><strong>{money(entry.pagibig)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Withholding tax</span><strong>{money(entry.withholding_tax)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Other deductions</span><strong>{money(entry.other_deductions)}</strong></div><div className="flex justify-between border-t border-slate-100 pt-3 text-[12px] sm:text-sm"><span className="font-semibold text-slate-800">Total deductions</span><strong>{money(entry.total_deductions)}</strong></div></div></div>
                    </section>
                ) : <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No payroll entry is available for this period.</div>}

                {canAdmin && adminSummary && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2"><UsersRound size={18} className="text-blue-800" /><h2 className="text-base font-bold text-slate-950 sm:text-lg">HR payroll period overview</h2></div>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-4"><div className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4"><div className="text-[9px] uppercase text-slate-500">Employees</div><div className="mt-1 text-xl font-bold">{adminSummary.employees}</div></div><div className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4"><div className="text-[9px] uppercase text-slate-500">Released</div><div className="mt-1 text-xl font-bold">{adminSummary.released}</div></div><div className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4"><div className="text-[9px] uppercase text-slate-500">Gross</div><div className="mt-1 text-[13px] font-bold sm:text-lg">{money(adminSummary.gross)}</div></div><div className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4"><div className="text-[9px] uppercase text-slate-500">Deductions</div><div className="mt-1 text-[13px] font-bold sm:text-lg">{money(adminSummary.deductions)}</div></div><div className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4"><div className="text-[9px] uppercase text-slate-500">Net</div><div className="mt-1 text-[13px] font-bold sm:text-lg">{money(adminSummary.net)}</div></div></div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"><div className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4"><h3 className="text-sm font-bold text-slate-950">Employee payroll sample</h3><p className="mt-1 text-[9px] text-slate-500 sm:text-xs">Showing a subset of the synthetic municipal payroll population.</p></div><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Office</th><th className="px-5 py-3">Gross</th><th className="px-5 py-3">Deductions</th><th className="px-5 py-3">Net</th></tr></thead><tbody className="divide-y divide-slate-100">{adminEntries.map((row) => <tr key={row.id}><td className="px-5 py-3.5 font-semibold text-slate-900">{row.employee?.full_name || row.employee?.employee_number}</td><td className="px-5 py-3.5 text-slate-600">{row.employee?.department?.short_name || row.employee?.department?.name}</td><td className="px-5 py-3.5">{money(row.gross_pay)}</td><td className="px-5 py-3.5">{money(row.total_deductions)}</td><td className="px-5 py-3.5 font-semibold">{money(row.net_pay)}</td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 md:hidden">{adminEntries.slice(0, 12).map((row) => <div key={row.id} className="p-3.5"><div className="flex items-start justify-between gap-3"><div><div className="text-[12px] font-semibold text-slate-950">{row.employee?.full_name || row.employee?.employee_number}</div><div className="mt-0.5 text-[9px] text-slate-500">{row.employee?.department?.short_name || row.employee?.department?.name}</div></div><div className="text-right"><div className="text-[10px] text-slate-400">Net pay</div><div className="text-[12px] font-bold text-slate-900">{money(row.net_pay)}</div></div></div></div>)}</div></div>
                    </section>
                )}

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[9px] leading-4 text-amber-900 sm:text-xs">Prototype payroll values demonstrate data flow and access separation only. Production government payroll computation, statutory rules, deductions, validation, and approval controls require formal implementation and verification.</div>
            </div>
        </AppLayout>
    );
}
