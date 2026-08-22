import { Building2, Crown, Gavel, Network, Users } from 'lucide-react';
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

const officeTypeLabel = (value: string) => value.replace(/_/g, ' ');

export default function Index({ departments, summary }: { departments: Office[]; summary: Summary }) {
    const executive = departments.filter((office) => office.branch === 'executive');
    const legislative = departments.filter((office) => office.branch === 'legislative');

    const officeCard = (office: Office) => (
        <article key={office.id} className={`rounded-3xl border bg-white p-6 shadow-sm ${office.is_executive ? 'border-blue-200 ring-1 ring-blue-100' : office.is_legislative ? 'border-indigo-200' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${office.is_executive ? 'bg-blue-900 text-white' : office.is_legislative ? 'bg-indigo-50 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                    {office.is_executive ? <Crown size={20} /> : office.is_legislative ? <Gavel size={20} /> : <Building2 size={20} />}
                </div>
                <div className="text-right">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{office.code}</span>
                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{officeTypeLabel(office.office_type)}</div>
                </div>
            </div>
            <h2 className="mt-5 text-lg font-bold leading-6 text-slate-950">{office.name}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3"><div className="text-xl font-bold text-slate-950">{office.active_employees_count}</div><div className="text-xs text-slate-500">Employees</div></div>
                <div className="rounded-xl bg-slate-50 p-3"><div className="text-xl font-bold text-slate-950">{office.active_transactions_count}</div><div className="text-xs text-slate-500">Active Work</div></div>
            </div>
            {office.is_executive && <div className="mt-4 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">Executive review and decision authority</div>}
            {office.is_legislative && <div className="mt-4 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800">Legislative branch routing workspace</div>}
        </article>
    );

    return <AppLayout title="Departments">
        <div className="mx-auto max-w-7xl space-y-7">
            <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Phase 1 municipal organization</div>
                <h1 className="mt-2 text-3xl font-bold text-slate-950">Office & Routing Directory</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">The existing department identity remains the compatibility anchor while Phase 1 adds executive and legislative branch metadata, office classifications, ordering, and explicit routability.</p>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Network className="text-blue-800" size={20} /><div className="mt-4 text-3xl font-bold text-slate-950">{summary.offices}</div><div className="text-sm text-slate-500">routable nodes</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Crown className="text-blue-800" size={20} /><div className="mt-4 text-3xl font-bold text-slate-950">{summary.executiveOffices}</div><div className="text-sm text-slate-500">executive / admin</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Gavel className="text-indigo-700" size={20} /><div className="mt-4 text-3xl font-bold text-slate-950">{summary.legislativeOffices}</div><div className="text-sm text-slate-500">legislative nodes</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Users className="text-blue-800" size={20} /><div className="mt-4 text-3xl font-bold text-slate-950">{summary.employees}</div><div className="text-sm text-slate-500">active employees</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Building2 className="text-blue-800" size={20} /><div className="mt-4 text-3xl font-bold text-slate-950">{summary.activeTransactions}</div><div className="text-sm text-slate-500">active routed work</div></div>
            </section>

            <section className="space-y-4">
                <div><div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Executive / Administrative</div><h2 className="mt-1 text-xl font-bold text-slate-950">Municipal offices and functions</h2></div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{executive.map(officeCard)}</div>
            </section>

            <section className="space-y-4">
                <div><div className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Legislative Branch</div><h2 className="mt-1 text-xl font-bold text-slate-950">Vice Mayor, Sangguniang Bayan, and SB Secretary</h2></div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{legislative.map(officeCard)}</div>
            </section>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Phase 1 routing baseline:</strong> 33 internal routing nodes are configured for implementation. Parent hierarchy, aliases, acting assignments, and any additional municipal units remain subject to formal organizational-chart and workflow validation.</div>
        </div>
    </AppLayout>;
}
