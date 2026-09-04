import { router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import PageFrame from '../../components/PageFrame';
import PageHeader from '../../components/PageHeader';
import AppLayout from '../../layouts/AppLayout';

type Department = { id: number; name: string; short_name?: string | null };
type Event = { id: number; action: string; outcome: string; summary?: string | null; created_at: string; actor?: { name: string; employee?: { department?: Department | null } | null } | null; actor_department?: Department | null };
type Props = { events: Event[]; summary: { events24h: number; denied24h: number; events7d: number; distinctActors7d: number }; filters: { outcome?: string; action?: string; department_id?: string | number }; departments: Department[] };

const eventLabel = (value: string) => value.replace(/[._-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const departmentName = (event: Event) => event.actor?.employee?.department?.short_name || event.actor_department?.short_name || event.actor_department?.name || 'Not recorded';

export default function Index({ events, summary, filters, departments }: Props) {
    const [outcome, setOutcome] = useState(String(filters.outcome || ''));
    const [action, setAction] = useState(String(filters.action || ''));
    const [departmentId, setDepartmentId] = useState(String(filters.department_id || ''));
    const apply = (e: FormEvent) => { e.preventDefault(); router.get('/audit', { outcome: outcome || undefined, action: action || undefined, department_id: departmentId || undefined }, { preserveState: true, replace: true }); };
    const clear = () => { setOutcome(''); setAction(''); setDepartmentId(''); router.get('/audit', {}, { replace: true }); };
    const summaryItems = [
        ['Events · 24h', summary.events24h],
        ['Denied · 24h', summary.denied24h],
        ['Events · 7d', summary.events7d],
        ['Actors · 7d', summary.distinctActors7d],
    ] as const;

    return <AppLayout title="Audit & Security"><PageFrame>
        <PageHeader
            eyebrow="Security and accountability evidence"
            title="Audit & Security"
            description="Review privileged actions, workflow activity, authentication events, and denied access attempts while retaining the underlying event code as forensic evidence."
            icon={ShieldCheck}
        />

        <section aria-label="Audit activity summary" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {summaryItems.map(([label,value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4"><div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</div><div className={`mt-1.5 text-xl font-bold sm:text-2xl ${label.startsWith('Denied') && Number(value)>0 ? 'text-rose-700' : 'text-slate-950'}`}>{value}</div></div>)}
        </section>

        <form onSubmit={apply} aria-label="Audit event filters" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:grid-cols-2 lg:grid-cols-[160px_minmax(180px,1fr)_240px_auto_auto] lg:items-end">
            <label className="text-xs font-semibold text-slate-600">Outcome<select value={outcome} onChange={e=>setOutcome(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">All outcomes</option><option value="allowed">Allowed</option><option value="denied">Denied</option></select></label>
            <label className="text-xs font-semibold text-slate-600">Event code contains<input value={action} onChange={e=>setAction(e.target.value)} placeholder="e.g. hr. or property." className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"/></label>
            <label className="text-xs font-semibold text-slate-600">Office<select value={departmentId} onChange={e=>setDepartmentId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">All offices</option>{departments.map(d=><option key={d.id} value={d.id}>{d.short_name || d.name}</option>)}</select></label>
            <button className="rounded-xl bg-[#0b2852] px-4 py-2.5 text-sm font-semibold text-white">Apply</button>
            <button type="button" onClick={clear} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Clear</button>
        </form>

        <section aria-label="Audit event results" className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
                <div><h2 className="text-sm font-bold text-slate-900">Recorded events</h2><p className="mt-0.5 text-[10px] text-slate-500">Human-readable summary with raw event evidence retained.</p></div>
                <span className="text-[10px] font-semibold text-slate-500">{events.length} shown</span>
            </div>
            <div className="divide-y divide-slate-100">
                {events.map(event => <article key={event.id} className="grid min-w-0 gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(180px,0.8fr)_150px] lg:items-start">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words text-sm font-bold text-slate-950">{eventLabel(event.action)}</h3>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${event.outcome==='denied'?'bg-rose-50 text-rose-700':'bg-emerald-50 text-emerald-700'}`}>{event.outcome}</span>
                        </div>
                        <p className="mt-1.5 break-words text-[11px] leading-5 text-slate-600 sm:text-xs">{event.summary || 'No additional event summary was recorded.'}</p>
                        <div className="mt-2 break-all font-mono text-[9px] text-slate-400">Event code: {event.action}</div>
                    </div>
                    <dl className="grid grid-cols-2 gap-3 text-[10px] lg:grid-cols-1">
                        <div><dt className="font-bold uppercase tracking-wide text-slate-400">Actor</dt><dd className="mt-0.5 break-words font-semibold text-slate-700">{event.actor?.name || 'System'}</dd></div>
                        <div><dt className="font-bold uppercase tracking-wide text-slate-400">Office</dt><dd className="mt-0.5 break-words text-slate-600">{departmentName(event)}</dd></div>
                    </dl>
                    <div className="text-[10px] text-slate-500 lg:text-right"><div className="font-bold uppercase tracking-wide text-slate-400">Recorded</div><time className="mt-0.5 block" dateTime={event.created_at}>{new Date(event.created_at).toLocaleString()}</time></div>
                </article>)}
                {events.length===0 && <div className="px-5 py-10 text-center text-sm text-slate-500">No audit events match the current filters.</div>}
            </div>
        </section>
    </PageFrame></AppLayout>;
}
