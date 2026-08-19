import { Link } from '@inertiajs/react';
import { BriefcaseBusiness, FileText, IdCard, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';

type Employee = {
    id: number;
    employee_number: string;
    full_name?: string | null;
    work_email?: string | null;
    position_title: string;
    employment_status: string;
    department: { id: number; code: string; name: string; short_name?: string | null };
    supervisor?: { id: number; employee_number: string; full_name?: string | null; position_title: string } | null;
};

type EmploymentProfile = { employment_type?: string | null; appointment_date?: string | null; employment_start_date?: string | null; contract_end_date?: string | null; biometric_external_id?: string | null };
type PrivateProfile = { date_of_birth?: string | null; personal_email?: string | null; mobile_number?: string | null; home_address?: string | null; emergency_contact_name?: string | null; emergency_contact_relationship?: string | null; emergency_contact_phone?: string | null; government_ids: { gsis?: string | null; philhealth?: string | null; pagibig?: string | null; tin?: string | null } };
type Document = { id: number; public_id: string; title: string; document_type: string; classification: string; retention_code?: string | null; created_at?: string | null };
type Assignment = { id: number; reference_no: string; title: string; priority: string; status: string; due_at?: string | null };

type Props = {
    employee: Employee;
    employmentProfile: EmploymentProfile | null;
    privateProfile: PrivateProfile | null;
    documents: Document[];
    activeAssignments: Assignment[];
    permissions: { isSelf: boolean; canViewPrivate: boolean; canViewHrRecord: boolean; canViewWorkContext: boolean; healthVaultAccess: boolean };
};

const value = (input?: string | null) => input || 'Not recorded';

export default function Show({ employee, employmentProfile, privateProfile, documents, activeAssignments, permissions }: Props) {
    return <AppLayout title="Employee Profile">
        <div className="mx-auto max-w-6xl space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-900"><UserRound size={26} /></div><div><div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{employee.employee_number}</div><h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{employee.full_name || 'Employee'}</h1><div className="mt-1 text-sm text-slate-600">{employee.position_title} · {employee.department.short_name || employee.department.name}</div></div></div>
                    <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase text-emerald-800">{employee.employment_status}</span>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Work email</div><div className="mt-1 break-all text-sm font-semibold text-slate-800">{value(employee.work_email)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Office</div><div className="mt-1 text-sm font-semibold text-slate-800">{employee.department.name}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Supervisor</div><div className="mt-1 text-sm font-semibold text-slate-800">{employee.supervisor?.full_name || 'Not assigned'}</div></div></div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><BriefcaseBusiness size={19} className="text-blue-800" /><h2 className="font-bold text-slate-950">Employment record</h2></div>{employmentProfile ? <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs text-slate-400">Employment type</dt><dd className="mt-1 font-semibold text-slate-800">{value(employmentProfile.employment_type)}</dd></div><div><dt className="text-xs text-slate-400">Appointment date</dt><dd className="mt-1 font-semibold text-slate-800">{value(employmentProfile.appointment_date)}</dd></div><div><dt className="text-xs text-slate-400">Start date</dt><dd className="mt-1 font-semibold text-slate-800">{value(employmentProfile.employment_start_date)}</dd></div><div><dt className="text-xs text-slate-400">Contract end</dt><dd className="mt-1 font-semibold text-slate-800">{value(employmentProfile.contract_end_date)}</dd></div><div className="col-span-2"><dt className="text-xs text-slate-400">Biometric reference</dt><dd className="mt-1 font-semibold text-slate-800">{value(employmentProfile.biometric_external_id)}</dd></div></dl> : <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500"><LockKeyhole className="mb-2" size={18} />Employment-record details are restricted to the employee and authorized HR personnel.</div>}</section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><IdCard size={19} className="text-blue-800" /><h2 className="font-bold text-slate-950">Private profile</h2></div>{privateProfile ? <div className="mt-5 space-y-4 text-sm"><div><div className="text-xs text-slate-400">Personal contact</div><div className="mt-1 font-semibold text-slate-800">{value(privateProfile.personal_email)} · {value(privateProfile.mobile_number)}</div></div><div><div className="text-xs text-slate-400">Home address</div><div className="mt-1 font-semibold text-slate-800">{value(privateProfile.home_address)}</div></div><div><div className="text-xs text-slate-400">Emergency contact</div><div className="mt-1 font-semibold text-slate-800">{value(privateProfile.emergency_contact_name)} · {value(privateProfile.emergency_contact_relationship)} · {value(privateProfile.emergency_contact_phone)}</div></div><div><div className="text-xs text-slate-400">Government identifiers</div><div className="mt-1 grid grid-cols-2 gap-2 text-xs"><span>GSIS: {value(privateProfile.government_ids.gsis)}</span><span>PhilHealth: {value(privateProfile.government_ids.philhealth)}</span><span>Pag-IBIG: {value(privateProfile.government_ids.pagibig)}</span><span>TIN: {value(privateProfile.government_ids.tin)}</span></div></div></div> : <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500"><ShieldCheck className="mb-2" size={18} />Private contact and government identifiers are not part of the ordinary directory view.</div>}</section>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><FileText size={19} className="text-blue-800" /><h2 className="font-bold text-slate-950">201-file document foundation</h2></div>{permissions.canViewHrRecord ? <div className="mt-4 space-y-2">{documents.map((document) => <div key={document.id} className="rounded-xl border border-slate-200 px-4 py-3"><div className="font-semibold text-slate-900">{document.title}</div><div className="mt-1 text-xs uppercase text-slate-400">{document.document_type.replaceAll('_', ' ')} · {document.classification}</div></div>)}{documents.length === 0 && <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No employee-linked document metadata yet. Binary upload and protected retrieval are a later document-service step.</div>}</div> : <div className="mt-5 text-sm text-slate-500">201-file metadata is restricted.</div>}</section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><BriefcaseBusiness size={19} className="text-blue-800" /><h2 className="font-bold text-slate-950">Active assigned work</h2></div>{permissions.canViewWorkContext ? <div className="mt-4 space-y-2">{activeAssignments.map((assignment) => <Link key={assignment.id} href={`/transactions/${assignment.id}`} className="block rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"><div className="text-xs font-bold text-blue-700">{assignment.reference_no}</div><div className="mt-1 font-semibold text-slate-900">{assignment.title}</div><div className="mt-1 text-xs uppercase text-slate-400">{assignment.priority} · {assignment.status}</div></Link>)}{activeAssignments.length === 0 && <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No active assignments visible.</div>}</div> : <div className="mt-5 text-sm text-slate-500">Work context is limited to the employee, authorized office leadership, HR, and executive oversight.</div>}</section>
            </div>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 shrink-0 text-amber-800" size={20} /><div><div className="font-bold text-amber-950">Employee health information is a separate restricted vault.</div><p className="mt-1 text-sm leading-6 text-amber-900">This general employee profile intentionally does not expose medical content. Phase 1 health records will be permission-isolated and limited to employment/occupational-health records; RHU clinical patient history remains outside HRIS.</p></div></div></section>
        </div>
    </AppLayout>;
}
