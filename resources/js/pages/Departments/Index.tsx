import { Building2, Crown, Gavel, Network, Users } from 'lucide-react';
import PageFrame from '../../components/PageFrame';
import PageHeader from '../../components/PageHeader';
import AppLayout from '../../layouts/AppLayout';

type Office = {
    id: number;
    code: string;
    name: string;
    short_name?: string | null;
    branch: string;
    office_type: string;
    is_routable: boolean;
    active_employees_count: number;
    active_transactions_count: number;
    is_executive: boolean;
    is_legislative: boolean;
};

type Summary = {
    offices: number;
    executiveOffices: number;
    legislativeOffices: number;
    employees: number;
    activeTransactions: number;
};

const officeTypeLabel = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());

export default function Index({ departments, summary }: { departments: Office[]; summary: Summary }) {
    const executive = departments.filter((office) => office.branch === 'executive');
    const legislative = departments.filter((office) => office.branch === 'legislative');

    const officeCard = (office: Office) => (
        <article key={office.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${office.is_executive ? 'bg-blue-900 text-white' : office.is_legislative ? 'bg-indigo-50 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                    {office.is_executive ? <Crown size={17} aria-hidden="true" /> : office.is_legislative ? <Gavel size={17} aria-hidden="true" /> : <Building2 size={17} aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">{office.code}</span>
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{officeTypeLabel(office.office_type)}</span>
                    </div>
                    <h2 className="mt-2 break-words text-sm font-bold leading-5 text-slate-950 sm:text-base">{office.name}</h2>
                    {office.short_name && office.short_name !== office.name ? <div className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">{office.short_name}</div> : null}
                </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <div><dt className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Active employees</dt><dd className="mt-1 text-lg font-bold text-slate-950">{office.active_employees_count}</dd></div>
                <div><dt className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Active work</dt><dd className="mt-1 text-lg font-bold text-slate-950">{office.active_transactions_count}</dd></div>
            </dl>
        </article>
    );

    const summaryItems = [
        { label: 'Municipal offices', value: summary.offices, icon: Network },
        { label: 'Executive / administrative', value: summary.executiveOffices, icon: Crown },
        { label: 'Legislative offices', value: summary.legislativeOffices, icon: Gavel },
        { label: 'Active employees', value: summary.employees, icon: Users },
        { label: 'Active routed work', value: summary.activeTransactions, icon: Building2 },
    ];

    return <AppLayout title="Municipal Offices">
        <PageFrame>
            <PageHeader
                eyebrow="Municipal operating structure"
                title="Municipal Offices"
                description="Directory of active municipal offices, branch placement, staffing, and current routed workload used across the intra-office portal."
                icon={Building2}
            />

            <section aria-label="Municipal office summary" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {summaryItems.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
                        <Icon className="text-blue-800" size={17} aria-hidden="true" />
                        <div className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">{value}</div>
                        <div className="mt-0.5 text-[9px] font-semibold leading-4 text-slate-500 sm:text-[10px]">{label}</div>
                    </div>
                ))}
            </section>

            <section className="space-y-3" aria-labelledby="executive-offices-heading">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Executive and administrative branch</div>
                    <h2 id="executive-offices-heading" className="mt-1 text-lg font-bold text-slate-950">Offices supporting municipal operations</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{executive.map(officeCard)}</div>
            </section>

            <section className="space-y-3" aria-labelledby="legislative-offices-heading">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700">Legislative branch</div>
                    <h2 id="legislative-offices-heading" className="mt-1 text-lg font-bold text-slate-950">Vice Mayor, Sangguniang Bayan, and legislative support</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{legislative.map(officeCard)}</div>
            </section>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[11px] leading-5 text-slate-600 sm:text-xs">
                Office names, branch placement, and routing availability reflect the municipality structure currently configured for this portal.
            </div>
        </PageFrame>
    </AppLayout>;
}
