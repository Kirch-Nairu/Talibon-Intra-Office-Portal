import { Link, router } from '@inertiajs/react';
import { Building2, Search, UserRoundCheck, UsersRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import PageFrame from '../../components/PageFrame';
import PageHeader from '../../components/PageHeader';
import AppLayout from '../../layouts/AppLayout';

type Department = { code: string; name: string; short_name?: string };
type Employee = { id: number; employee_number: string; full_name?: string; work_email?: string; position_title: string; employment_status: string; user_id?: number | null; department: Department };
type PaginatedEmployees = { data: Employee[]; current_page: number; last_page: number; per_page: number; total: number; prev_page_url?: string | null; next_page_url?: string | null };
type Props = { employees: PaginatedEmployees; departments: Department[]; filters: { q: string; department: string }; summary: { employees: number; portalAccounts: number; featuredLogins: number; offices: number } };

export default function EmployeeDirectory({ employees, departments, filters, summary }: Props) {
    const [q, setQ] = useState(filters.q || '');
    const [department, setDepartment] = useState(filters.department || '');
    const submit = (event: FormEvent) => { event.preventDefault(); router.get('/employees', { q, department }, { preserveState: true, preserveScroll: true, replace: true }); };
    const reset = () => { setQ(''); setDepartment(''); router.get('/employees', {}, { preserveState: true, replace: true }); };

    return <AppLayout title="Employee Directory"><PageFrame>
        <PageHeader
            eyebrow="Municipal workforce"
            title="Employee Directory"
            description="Phase 1 workforce directory and entry point to permission-aware employee profiles. Synthetic data remains clearly separated from future production employee records."
            icon={UsersRound}
            aside={<div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-200 sm:text-xs"><UserRoundCheck size={15} /> {summary.featuredLogins} featured demo logins</div>}
        />

        <section className="grid grid-cols-3 gap-2.5 sm:gap-4"><div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5"><UsersRound size={17} className="text-blue-800" /><div className="mt-2 text-xl font-bold text-slate-950 sm:text-3xl">{summary.employees}</div><div className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-500 sm:text-xs">Employees</div></div><div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5"><Building2 size={17} className="text-blue-800" /><div className="mt-2 text-xl font-bold text-slate-950 sm:text-3xl">{summary.offices}</div><div className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-500 sm:text-xs">Offices</div></div><div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5"><UserRoundCheck size={17} className="text-blue-800" /><div className="mt-2 text-xl font-bold text-slate-950 sm:text-3xl">{summary.portalAccounts}</div><div className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-500 sm:text-xs">Portal identities</div></div></section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"><form onSubmit={submit} className="grid gap-2.5 border-b border-slate-100 p-3 sm:grid-cols-[1fr_280px_auto_auto] sm:p-5"><label className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, email, or position" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-[12px] outline-none focus:border-blue-500 sm:text-sm" /></label><select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[12px] sm:text-sm"><option value="">All offices</option>{departments.map((office) => <option key={office.code} value={office.code}>{office.short_name || office.name}</option>)}</select><button className="rounded-xl bg-[#0b2852] px-4 py-2.5 text-[12px] font-semibold text-white sm:text-sm">Search</button><button type="button" onClick={reset} className="rounded-xl border border-slate-300 px-4 py-2.5 text-[12px] font-semibold text-slate-700 sm:text-sm">Reset</button></form>

            <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Office</th><th className="px-5 py-3">Position</th><th className="px-5 py-3">Portal</th></tr></thead><tbody className="divide-y divide-slate-100">{employees.data.map((employee) => <tr key={employee.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><Link href={`/employees/${employee.id}`} className="font-semibold text-slate-950 hover:text-blue-800">{employee.full_name || 'Synthetic Employee'}</Link><div className="mt-0.5 text-xs text-slate-500">{employee.employee_number}{employee.work_email ? ` · ${employee.work_email}` : ''}</div></td><td className="px-5 py-4 text-slate-700">{employee.department.short_name || employee.department.name}</td><td className="px-5 py-4 text-slate-700">{employee.position_title}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-800">Enabled</span></td></tr>)}</tbody></table></div>
            <div className="divide-y divide-slate-100 md:hidden">{employees.data.map((employee) => <div key={employee.id} className="p-3.5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`/employees/${employee.id}`} className="text-[13px] font-semibold text-slate-950 hover:text-blue-800">{employee.full_name || 'Synthetic Employee'}</Link><div className="mt-0.5 text-[9px] font-semibold text-blue-700">{employee.employee_number}</div></div><span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold uppercase text-emerald-800">Portal</span></div><div className="mt-2 text-[11px] text-slate-600">{employee.department.short_name || employee.department.name}</div><div className="mt-0.5 text-[11px] text-slate-500">{employee.position_title}</div>{employee.work_email && <div className="mt-1 break-all text-[9px] text-slate-400">{employee.work_email}</div>}</div>)}</div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-[10px] text-slate-500 sm:px-5 sm:text-xs"><div>Showing {employees.data.length} of {employees.total} matching employees</div><div className="flex gap-2">{employees.prev_page_url ? <Link href={employees.prev_page_url} preserveScroll preserveState className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700">Previous</Link> : null}{employees.next_page_url ? <Link href={employees.next_page_url} preserveScroll preserveState className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700">Next</Link> : null}</div></div>
        </section>
    </PageFrame></AppLayout>;
}
