import { Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    Building2,
    FileBarChart,
    Gauge,
    LockKeyhole,
    RotateCcw,
    Search,
    ShieldCheck,
    UserRoundCog,
    Users,
} from 'lucide-react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import AppLayout from '../../layouts/AppLayout';

type Overview = {
    totalEmployees: number;
    portalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    employeesWithoutPortalAccounts: number;
    activeDepartments: number;
    privilegedUsers: number;
    mfaEnrolled: number;
};

type Department = { id: number; code: string; name: string; shortName: string | null };
type RegistryRow = {
    employee: string | null;
    employeeNumber: string | null;
    department: Omit<Department, 'id'> | null;
    position: string | null;
    role: string | null;
    loginEmail: string;
    active: boolean;
    mfaEnrolled: boolean;
};
type PageLink = { url: string | null; label: string; active: boolean };
type Registry = {
    data: RegistryRow[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    links: PageLink[];
};
type OfficeIdentity = {
    office: string;
    code: string;
    shortName: string | null;
    officialEmail: string | null;
    status: string;
};
type OperationSummary = {
    activeMunicipalWork?: number;
    municipalOverdue?: number;
    municipalUnassigned?: number;
    dueSoon?: number;
    executiveQueue?: number;
    completedThisMonth?: number;
};
type DepartmentWorkload = {
    id: number;
    code: string;
    name: string;
    shortName: string | null;
    active: number;
    unassigned: number;
    dueSoon: number;
    overdue: number;
};
type SecurityEvent = {
    actor: string | null;
    action: string;
    outcome: string;
    summary: string;
    createdAt: string | null;
};
type Security = {
    privilegedAccounts: number;
    mfaEnrolled: number;
    inactiveAccounts: number;
    recentEvents: SecurityEvent[];
};
type Filters = { search: string; department_id: string; role: string; status: string };
type Props = {
    overview: Overview;
    registry: Registry;
    registryFilters: { search: string; department_id: number | null; role: string; status: string };
    departmentOptions: Department[];
    roleOptions: string[];
    officeIdentities: OfficeIdentity[];
    operations: { summary: OperationSummary; departmentWorkload: DepartmentWorkload[] };
    security: Security;
};

const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export default function AdminIndex({
    overview,
    registry,
    registryFilters,
    departmentOptions,
    roleOptions,
    officeIdentities,
    operations,
    security,
}: Props) {
    const { data, setData, get, processing } = useForm<Filters>({
        search: registryFilters.search ?? '',
        department_id: registryFilters.department_id?.toString() ?? '',
        role: registryFilters.role ?? '',
        status: registryFilters.status ?? '',
    });

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        get('/admin', { preserveScroll: true, preserveState: true, replace: true });
    };
    const clearFilters = () => router.get('/admin', {}, { preserveScroll: true, replace: true });

    const overviewCards = [
        ['Employees', overview.totalEmployees],
        ['Portal Users', overview.portalUsers],
        ['Active Users', overview.activeUsers],
        ['Inactive Users', overview.inactiveUsers],
        ['Employees without Portal Account', overview.employeesWithoutPortalAccounts],
        ['Active Departments', overview.activeDepartments],
        ['Privileged Users', overview.privilegedUsers],
        ['MFA Enrolled', overview.mfaEnrolled],
    ] as const;

    const operationCards = [
        ['Active municipal work', operations.summary.activeMunicipalWork ?? 0],
        ['Overdue', operations.summary.municipalOverdue ?? 0],
        ['Unassigned', operations.summary.municipalUnassigned ?? 0],
        ['Completed this month', operations.summary.completedThisMonth ?? 0],
    ] as const;

    return <AppLayout title="System Administration">
        <div className="mx-auto max-w-7xl space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"><ShieldCheck size={16} /> Municipality system control</div>
                        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">System Administration</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Read-only identity, security and municipal operational oversight. Administrative access does not widen confidential correspondence, attachments or private HR authorization.</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900"><div className="font-bold">Identity rule</div><div className="mt-1">Employee/User records identify the person. Email is the login identity.</div></div>
                </div>
            </section>

            <Section title="System Overview" icon={<Gauge size={17} />} description="Factual municipality and account totals from the current database.">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {overviewCards.map(([name, value]) => <Metric key={name} label={name} value={value} />)}
                </div>
            </Section>

            <Section title="Identity & Access" icon={<Users size={17} />} description="Read-only Portal account registry. Results are filtered and paginated on the server at 25 rows per page.">
                <form onSubmit={applyFilters} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-xs font-semibold text-slate-600 lg:col-span-2">Search employee, employee number or login email
                        <div className="relative mt-1.5"><Search className="absolute left-3 top-3 text-slate-400" size={15} /><input value={data.search} onChange={(event: ChangeEvent<HTMLInputElement>) => setData('search', event.target.value)} className={`${fieldClass} pl-9`} placeholder="Search identity registry" /></div>
                    </label>
                    <Filter label="Department" value={data.department_id} onChange={(value) => setData('department_id', value)}><option value="">All departments</option>{departmentOptions.map((department) => <option key={department.id} value={department.id}>{department.shortName || department.name}</option>)}</Filter>
                    <Filter label="Role" value={data.role} onChange={(value) => setData('role', value)}><option value="">All roles</option>{roleOptions.map((role) => <option key={role} value={role}>{label(role)}</option>)}</Filter>
                    <Filter label="Account status" value={data.status} onChange={(value) => setData('status', value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></Filter>
                    <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
                        <button disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-[#0b2852] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"><Search size={14} /> Apply filters</button>
                        <button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700"><RotateCcw size={14} /> Clear</button>
                    </div>
                </form>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 text-xs text-slate-500"><span>Identity registry</span><span className="font-semibold">{registry.total.toLocaleString()} accounts</span></div>
                    {registry.data.length === 0 ? <div className="bg-white px-5 py-12 text-center text-sm text-slate-500">No accounts match the current filters.</div> : <div className="overflow-x-auto"><table className="min-w-full whitespace-nowrap text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr>{['Employee', 'Employee Number', 'Department', 'Position', 'Portal Role', 'Login Email', 'Status', 'MFA'].map((heading) => <th key={heading} className="px-4 py-3 font-bold">{heading}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100 bg-white">{registry.data.map((row, index) => <tr key={`${row.loginEmail}-${index}`} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-950">{row.employee || 'Unlinked portal user'}</td><td className="px-4 py-3 text-slate-600">{row.employeeNumber || '—'}</td><td className="px-4 py-3 text-slate-600">{row.department?.shortName || row.department?.name || '—'}</td><td className="px-4 py-3 text-slate-600">{row.position || '—'}</td><td className="px-4 py-3 text-slate-600">{row.role ? label(row.role) : '—'}</td><td className="px-4 py-3 text-slate-600">{row.loginEmail}</td><td className="px-4 py-3"><Status ok={row.active} yes="Active" no="Inactive" /></td><td className="px-4 py-3"><Status ok={row.mfaEnrolled} yes="Enrolled" no="Not enrolled" neutral /></td>
                        </tr>)}</tbody>
                    </table></div>}
                    {registry.last_page > 1 && <nav className="flex flex-wrap gap-1 border-t border-slate-200 bg-white px-4 py-3">{registry.links.map((page, index) => page.url ? <Link key={`${page.label}-${index}`} href={page.url} preserveScroll className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${page.active ? 'bg-blue-700 text-white' : 'border border-slate-200 text-slate-600'}`} dangerouslySetInnerHTML={{ __html: page.label }} /> : <span key={`${page.label}-${index}`} className="rounded-lg px-3 py-1.5 text-xs text-slate-300" dangerouslySetInnerHTML={{ __html: page.label }} />)}</nav>}
                </div>
            </Section>

            <div className="grid gap-5 xl:grid-cols-2">
                <Section title="Office Digital Identity" icon={<Building2 size={17} />} description="Official office login identities are recorded only when explicitly configured.">
                    <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200 bg-white">{officeIdentities.map((office) => <div key={office.code} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-sm font-semibold text-slate-950">{office.shortName || office.office}</div><div className="text-xs text-slate-500">{office.code}</div></div><div className="text-left sm:text-right"><div className="text-xs font-semibold text-slate-700">{office.officialEmail || 'Awaiting official office email registry'}</div><div className="mt-0.5 text-[10px] text-slate-400">{office.status}</div></div></div>)}</div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">Department Heads use the approved official office identity. Ordinary employees remain individually accountable; temporary staff login convention: <span className="font-mono">&lt;name&gt;.&lt;office-code&gt;.talibon@gmail.com</span>.</p>
                </Section>

                <Section title="Security & Audit" icon={<LockKeyhole size={17} />} description="Bounded authentication and security metadata only.">
                    <div className="grid grid-cols-3 gap-3"><Metric label="Privileged accounts" value={security.privilegedAccounts} /><Metric label="MFA enrolled" value={security.mfaEnrolled} /><Metric label="Inactive accounts" value={security.inactiveAccounts} /></div>
                    <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">{security.recentEvents.length === 0 ? <div className="px-4 py-8 text-center text-xs text-slate-500">No recent authentication or security activity.</div> : security.recentEvents.map((event, index) => <div key={`${event.action}-${event.createdAt}-${index}`} className="px-4 py-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-xs font-semibold text-slate-900">{event.actor || 'System'} · {label(event.action)}</div><div className="mt-1 text-xs leading-5 text-slate-500">{event.summary}</div></div><Status ok={event.outcome === 'allowed'} yes="Allowed" no={label(event.outcome)} neutral /></div>{event.createdAt && <div className="mt-1 text-[10px] text-slate-400">{new Date(event.createdAt).toLocaleString()}</div>}</div>)}</div>
                    <Link href="/audit" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:underline"><ShieldCheck size={14} /> Open Audit & Security</Link>
                </Section>
            </div>

            <Section title="Municipal Operations" icon={<Activity size={17} />} description="Existing authoritative transaction oversight. Restricted correspondence is not included or inferred here.">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{operationCards.map(([name, value]) => <Metric key={name} label={name} value={value} />)}</div>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Department</th><th className="px-4 py-3">Active</th><th className="px-4 py-3">Unassigned</th><th className="px-4 py-3">Due soon</th><th className="px-4 py-3">Overdue</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{operations.departmentWorkload.map((office) => <tr key={office.id}><td className="px-4 py-3 font-semibold text-slate-900">{office.shortName || office.name}</td><td className="px-4 py-3">{office.active}</td><td className="px-4 py-3">{office.unassigned}</td><td className="px-4 py-3">{office.dueSoon}</td><td className="px-4 py-3 font-semibold text-rose-700">{office.overdue}</td></tr>)}</tbody></table></div>
            </Section>

            <Section title="Quick Access" icon={<UserRoundCog size={17} />} description="Current authorized administration and operational surfaces.">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[
                    ['System Administration', '/admin', ShieldCheck], ['Dashboard', '/dashboard', Gauge], ['Reports', '/reports', FileBarChart], ['Departments', '/departments', Building2], ['Audit & Security', '/audit', LockKeyhole],
                ].map(([name, href, Icon]) => <Link key={String(name)} href={String(href)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50"><Icon size={17} className="text-blue-700" />{name}</Link>)}</div>
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4"><div className="text-sm font-semibold text-slate-800">Register Employee Account</div><div className="mt-1 text-xs text-slate-500">Coming after identity rollout. No account mutation is available from this prototype.</div></div>
            </Section>
        </div>
    </AppLayout>;
}

function Section({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
    return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-start gap-3"><div className="mt-0.5 rounded-xl bg-blue-50 p-2 text-blue-700">{icon}</div><div><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div>{children}</section>;
}
function Metric({ label: text, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"><div className="text-2xl font-bold text-slate-950">{value.toLocaleString()}</div><div className="mt-1 text-xs font-medium text-slate-500">{text}</div></div>; }
function Status({ ok, yes, no, neutral = false }: { ok: boolean; yes: string; no: string; neutral?: boolean }) { return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${ok ? 'bg-emerald-50 text-emerald-700' : neutral ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-700'}`}>{ok ? yes : no}</span>; }
function Filter({ label: text, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) { return <label className="text-xs font-semibold text-slate-600">{text}<select value={value} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)} className={`mt-1.5 ${fieldClass}`}>{children}</select></label>; }
