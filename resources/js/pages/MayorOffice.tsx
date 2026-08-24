import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Building2, Radio, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useVisiblePolling } from '../hooks/useVisiblePolling';

type Office = { name: string; short_name?: string | null };
type Tx = {
    id: number;
    reference_no: string;
    title: string;
    status: string;
    priority: string;
    due_at?: string | null;
    origin_department?: Office | null;
    current_department?: Office | null;
};
type Bottleneck = { current_department_id: number; open_count: number; current_department?: Office | null };
type Props = {
    queue: Tx[];
    overdue: Tx[];
    returned: Tx[];
    bottlenecks: Bottleneck[];
    stats: {
        forApproval: number;
        forReview: number;
        highPriority: number;
        total: number;
        municipalityOpen: number;
        municipalityOverdue: number;
        returnedOrInfoRequested: number;
    };
};

export default function MayorOffice(initial: Props) {
    const [live, setLive] = useState(initial);

    useEffect(() => {
        setLive(initial);
    }, [
        initial.queue,
        initial.overdue,
        initial.returned,
        initial.bottlenecks,
        initial.stats,
    ]);

    useVisiblePolling(async (signal) => {
        const response = await fetch('/mayor-office/live', {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
            signal,
        });

        if (
            !response.ok
            || !response.headers.get('content-type')?.includes('application/json')
        ) {
            return;
        }

        setLive(await response.json() as Props);
    }, 8000);

    const { queue, overdue, returned, bottlenecks, stats } = live;

    const cards = [
        ['Mayor Queue', stats.total],
        ['LGU Open Work', stats.municipalityOpen],
        ['LGU Overdue', stats.municipalityOverdue],
        ['Returned / Info', stats.returnedOrInfoRequested],
    ];

    return <AppLayout title="Mayor's Office"><div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-3xl bg-[#0b2852] p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><div className="flex items-center gap-2 text-blue-200"><Building2 size={20}/><span className="text-xs font-bold uppercase tracking-[0.2em]">Executive control</span></div><h1 className="mt-3 text-3xl font-bold">Municipality-wide Accountability</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">Mayor's Office decisions, overdue work across all offices, unresolved returns, and office bottlenecks in one executive surface.</p></div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100"><Radio size={15} className="animate-pulse"/>Live operational view</div>
            </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([label,value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-2 text-2xl font-bold text-slate-950">{value}</div></div>)}</section>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b px-5 py-4"><h2 className="font-bold">Items requiring executive attention</h2><p className="mt-1 text-xs text-slate-500">Mayor's Office queue sorted by urgency and due date.</p></div><div className="divide-y">{queue.map(tx => <Link key={tx.id} href={`/transactions/${tx.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-blue-50/40"><div><div className="text-xs font-bold text-blue-700">{tx.reference_no}</div><div className="mt-1 font-semibold">{tx.title}</div><div className="mt-1 text-xs text-slate-500">Origin: {tx.origin_department?.short_name || tx.origin_department?.name || '—'} · {tx.status.replaceAll('_',' ')}</div></div><ArrowRight size={17} className="shrink-0 text-slate-400"/></Link>)}{queue.length===0&&<div className="p-8 text-center text-sm text-slate-500">No executive queue items.</div>}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Office bottlenecks</h2><div className="mt-4 space-y-3">{bottlenecks.map((b,i)=><div key={`${b.current_department_id}-${i}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div className="text-sm font-semibold">{b.current_department?.short_name || b.current_department?.name || 'Unassigned'}</div><div className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">{b.open_count} open</div></div>)}{bottlenecks.length===0&&<div className="text-sm text-slate-500">No bottleneck data.</div>}</div></div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-3xl border border-rose-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><AlertTriangle size={18} className="text-rose-700"/><h2 className="font-bold">Overdue across the LGU</h2></div><div className="mt-4 space-y-2">{overdue.slice(0,12).map(tx=><Link key={tx.id} href={`/transactions/${tx.id}`} className="block rounded-xl bg-rose-50 p-3"><div className="text-xs font-bold text-rose-800">{tx.reference_no}</div><div className="mt-1 text-sm font-semibold">{tx.title}</div><div className="mt-1 text-xs text-rose-700">{tx.current_department?.short_name || tx.current_department?.name || '—'} · due {tx.due_at ? new Date(tx.due_at).toLocaleString() : '—'}</div></Link>)}{overdue.length===0&&<div className="text-sm text-slate-500">No overdue work.</div>}</div></div>
            <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><RotateCcw size={18} className="text-amber-700"/><h2 className="font-bold">Returned / information requested</h2></div><div className="mt-4 space-y-2">{returned.slice(0,12).map(tx=><Link key={tx.id} href={`/transactions/${tx.id}`} className="block rounded-xl bg-amber-50 p-3"><div className="text-xs font-bold text-amber-800">{tx.reference_no}</div><div className="mt-1 text-sm font-semibold">{tx.title}</div><div className="mt-1 text-xs text-amber-700">{tx.current_department?.short_name || tx.current_department?.name || '—'} · {tx.status.replaceAll('_',' ')}</div></Link>)}{returned.length===0&&<div className="text-sm text-slate-500">No unresolved returned work.</div>}</div></div>
        </section>
    </div></AppLayout>;
}
