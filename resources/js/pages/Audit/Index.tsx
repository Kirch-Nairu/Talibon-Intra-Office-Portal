import { router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import PageFrame from '../../components/PageFrame';
import PageHeader from '../../components/PageHeader';
import AppLayout from '../../layouts/AppLayout';

type Department = { id: number; name: string; short_name?: string | null };
type Event = { id: number; action: string; outcome: string; summary?: string | null; created_at: string; actor?: { name: string; employee?: { department?: Department | null } | null } | null; actor_department?: Department | null };
type Props = { events: Event[]; summary: { events24h: number; denied24h: number; events7d: number; distinctActors7d: number }; filters: { outcome?: string; action?: string; department_id?: string | number }; departments: Department[] };

export default function Index({ events, summary, filters, departments }: Props) {
    const [outcome, setOutcome] = useState(String(filters.outcome || ''));
    const [action, setAction] = useState(String(filters.action || ''));
    const [departmentId, setDepartmentId] = useState(String(filters.department_id || ''));
    const apply = (e: FormEvent) => { e.preventDefault(); router.get('/audit', { outcome: outcome || undefined, action: action || undefined, department_id: departmentId || undefined }, { preserveState: true, replace: true }); };
    const clear = () => { setOutcome(''); setAction(''); setDepartmentId(''); router.get('/audit', {}, { replace: true }); };

    return <AppLayout title="Audit & Security"><PageFrame>
        <PageHeader
            eyebrow="Phase 1 · M10 security evidence"
            title="Audit & Security Events"
            description="Privileged actions, workflow activity, and denied access attempts retained as application evidence."
            icon={ShieldCheck}
        />
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Events · 24h',summary.events24h],['Denied · 24h',summary.denied24h],['Events · 7d',summary.events7d],['Actors · 7d',summary.distinctActors7d]].map(([label,value])=><div key={String(label)} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="text-[9px] font-bold uppercase text-slate-500">{label}</div><div className={`mt-2 text-2xl font-bold ${String(label).startsWith('Denied') && Number(value)>0 ? 'text-rose-700' : 'text-slate-950'}`}>{value}</div></div>)}</section>
        <form onSubmit={apply} className="grid gap-3 rounded-3xl border bg-white p-4 text-slate-900 shadow-sm sm:grid-cols-[160px_1fr_240px_auto_auto] sm:items-end"><label className="text-xs font-semibold text-slate-600">Outcome<select value={outcome} onChange={e=>setOutcome(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"><option value="">All</option><option value="allowed">Allowed</option><option value="denied">Denied</option></select></label><label className="text-xs font-semibold text-slate-600">Action contains<input value={action} onChange={e=>setAction(e.target.value)} placeholder="e.g. hr. or property." className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"/></label><label className="text-xs font-semibold text-slate-600">Department<select value={departmentId} onChange={e=>setDepartmentId(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"><option value="">All departments</option>{departments.map(d=><option key={d.id} value={d.id}>{d.short_name || d.name}</option>)}</select></label><button className="rounded-xl bg-[#0b2852] px-4 py-2.5 text-sm font-semibold text-white">Apply</button><button type="button" onClick={clear} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Clear</button></form>
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm"><div className="hidden grid-cols-[170px_170px_1fr_110px_190px] gap-4 border-b bg-slate-50 px-6 py-3 text-xs font-bold uppercase text-slate-500 md:grid"><div>User</div><div>Department</div><div>Event</div><div>Outcome</div><div>Time</div></div><div className="divide-y">{events.map(event=><div key={event.id} className="grid gap-2 px-6 py-5 md:grid-cols-[170px_170px_1fr_110px_190px] md:gap-4"><div className="text-sm font-semibold">{event.actor?.name || 'System'}</div><div className="text-sm text-slate-500">{event.actor?.employee?.department?.short_name || event.actor_department?.short_name || event.actor_department?.name || '—'}</div><div><div className="text-xs font-bold uppercase tracking-wide text-blue-700">{event.action}</div><div className="mt-1 text-sm text-slate-600">{event.summary}</div></div><div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${event.outcome==='denied'?'bg-rose-50 text-rose-700':'bg-emerald-50 text-emerald-700'}`}>{event.outcome}</span></div><div className="text-xs text-slate-500">{new Date(event.created_at).toLocaleString()}</div></div>)}{events.length===0&&<div className="p-8 text-center text-sm text-slate-500">No events match the current filters.</div>}</div></section>
    </PageFrame></AppLayout>;
}
