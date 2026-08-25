import { Link, router, useForm } from '@inertiajs/react';
import { Download, FileBarChart, LoaderCircle, RotateCcw, Search } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import AppLayout from '../../layouts/AppLayout';

type Column = { key: string; label: string };
type Report = {
    key: string;
    label: string;
    description: string;
    filters: string[];
    columns: Column[];
    kind: 'aggregate' | 'rows';
};
type Option = { id: number; label: string };
type FilterOptions = {
    offices: Option[];
    statuses: string[];
    priorities: string[];
    transactionTypes: string[];
    lifecycles: string[];
    classifications: string[];
};
type Row = Record<string, string | number | null> & { id: string | number; detailUrl?: string };
type PageLink = { url: string | null; label: string; active: boolean };
type Result = {
    data: Row[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    links: PageLink[];
};
type Filters = {
    report: string;
    date_from: string;
    date_to: string;
    office: string;
    status: string;
    priority: string;
    transaction_type: string;
    lifecycle: string;
    classification: string;
};
type Props = {
    catalog: Report[];
    activeReport: string;
    filters: Partial<Filters>;
    filterOptions: FilterOptions;
    result: Result;
    errors?: Record<string, string>;
};

const headline = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800';

export default function ReportsIndex({ catalog, activeReport, filters, filterOptions, result, errors = {} }: Props) {
    const report = catalog.find((item) => item.key === activeReport) ?? catalog[0];
    const { data, setData, get, processing } = useForm<Filters>({
        report: activeReport,
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        office: filters.office?.toString() ?? '',
        status: filters.status ?? '',
        priority: filters.priority ?? '',
        transaction_type: filters.transaction_type ?? '',
        lifecycle: filters.lifecycle ?? '',
        classification: filters.classification ?? '',
    });

    const supports = (filter: string) => report.filters.includes(filter);
    const apply = (event: FormEvent) => {
        event.preventDefault();
        get('/reports', { preserveScroll: true, preserveState: true, replace: true });
    };
    const selectReport = (key: string) => router.get('/reports', { report: key }, { preserveScroll: true });
    const reset = () => router.get('/reports', { report: activeReport }, { preserveScroll: true, replace: true });
    const exportParams = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined) as [string, string][],
    );
    const exportUrl = `/reports/export/${activeReport}${exportParams.size ? `?${exportParams}` : ''}`;

    return <AppLayout title="Operational Reports">
        <div className="mx-auto max-w-7xl space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"><FileBarChart size={16} /> Core Portal</div>
                        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Operational Reports</h1>
                        <p className="mt-2 max-w-3xl text-sm text-slate-500">Permission-scoped operational evidence from current transactions and incoming correspondence.</p>
                    </div>
                    <label className="block min-w-64 text-xs font-semibold text-slate-600">Report
                        <select value={activeReport} onChange={(event) => selectReport(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                            {catalog.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                        </select>
                    </label>
                </div>
            </section>

            <form onSubmit={apply} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div><h2 className="font-bold text-slate-950">{report.label}</h2><p className="mt-1 text-xs text-slate-500">{report.description}</p></div>
                    <a href={exportUrl} className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#0b2852] px-4 py-2.5 text-xs font-semibold text-white"><Download size={15} /> Export CSV</a>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {supports('date_from') && <Field label="Date from" error={errors.date_from}><input type="date" value={data.date_from} onChange={(event) => setData('date_from', event.target.value)} className={fieldClass} /></Field>}
                    {supports('date_to') && <Field label="Date to" error={errors.date_to}><input type="date" value={data.date_to} onChange={(event) => setData('date_to', event.target.value)} className={fieldClass} /></Field>}
                    {supports('office') && <Field label="Office" error={errors.office}><select value={data.office} onChange={(event) => setData('office', event.target.value)} className={fieldClass}><option value="">All authorized offices</option>{filterOptions.offices.map((office) => <option key={office.id} value={office.id}>{office.label}</option>)}</select></Field>}
                    {supports('status') && <Choice label="Status" value={data.status} values={filterOptions.statuses} onChange={(value) => setData('status', value)} error={errors.status} />}
                    {supports('priority') && <Choice label="Priority" value={data.priority} values={filterOptions.priorities} onChange={(value) => setData('priority', value)} error={errors.priority} />}
                    {supports('transaction_type') && <Choice label="Transaction type" value={data.transaction_type} values={filterOptions.transactionTypes} onChange={(value) => setData('transaction_type', value)} error={errors.transaction_type} />}
                    {supports('lifecycle') && <Choice label="Lifecycle" value={data.lifecycle} values={filterOptions.lifecycles} onChange={(value) => setData('lifecycle', value)} error={errors.lifecycle} />}
                    {supports('classification') && <Choice label="Classification" value={data.classification} values={filterOptions.classifications} onChange={(value) => setData('classification', value)} error={errors.classification} />}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <button disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">{processing ? <LoaderCircle className="animate-spin" size={15} /> : <Search size={15} />} Apply</button>
                    <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700"><RotateCcw size={14} /> Reset</button>
                </div>
            </form>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h2 className="font-bold text-slate-950">Results</h2>
                    <span className="text-xs font-semibold text-slate-500">{result.total.toLocaleString()} {result.total === 1 ? 'row' : 'rows'}</span>
                </div>
                {result.data.length === 0 ? <div className="px-5 py-16 text-center text-sm text-slate-500">No authorized records match these filters.</div> :
                    <div className="overflow-x-auto"><table className="min-w-full whitespace-nowrap text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr>{report.columns.map((column) => <th key={column.key} className="px-4 py-3 font-bold">{column.label}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">{result.data.map((row) => <tr key={row.id} className="hover:bg-slate-50">{report.columns.map((column, index) => <td key={column.key} className="max-w-80 truncate px-4 py-3 text-slate-700" title={String(row[column.key] ?? '')}>{index === 0 && row.detailUrl ? <Link href={row.detailUrl} className="font-semibold text-blue-700 hover:underline">{display(row[column.key])}</Link> : display(row[column.key])}</td>)}</tr>)}</tbody>
                    </table></div>}
                {result.last_page > 1 && <nav className="flex flex-wrap gap-1 border-t border-slate-200 px-4 py-3">{result.links.map((link, index) => link.url ? <Link key={`${link.label}-${index}`} href={link.url} preserveScroll className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${link.active ? 'bg-blue-700 text-white' : 'border text-slate-600'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={`${link.label}-${index}`} className="rounded-lg px-3 py-1.5 text-xs text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>}
            </section>
        </div>
    </AppLayout>;
}

function display(value: string | number | null | undefined) {
    return value === null || value === undefined || value === '' ? '—' : String(value);
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return <label className="block text-xs font-semibold text-slate-600">{label}{children}{error && <span className="mt-1 block text-[10px] text-rose-700">{error}</span>}</label>;
}

function Choice({ label, value, values, onChange, error }: { label: string; value: string; values: string[]; onChange: (value: string) => void; error?: string }) {
    return <Field label={label} error={error}><select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}><option value="">All authorized values</option>{values.map((option) => <option key={option} value={option}>{headline(option)}</option>)}</select></Field>;
}
