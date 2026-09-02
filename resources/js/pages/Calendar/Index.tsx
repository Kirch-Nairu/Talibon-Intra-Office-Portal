import { Link } from '@inertiajs/react';
import { AlertTriangle, CalendarDays, Clock3 } from 'lucide-react';
import PageFrame from '../../components/PageFrame';
import PageHeader from '../../components/PageHeader';
import AppLayout from '../../layouts/AppLayout';

type CalendarEvent = {
    id: number;
    event_key: string;
    event_type: string;
    title: string;
    description?: string | null;
    priority: string;
    starts_at: string;
    ends_at?: string | null;
    all_day: boolean;
    location?: string | null;
    action_url?: string | null;
    status: string;
    department?: { code: string; name: string; short_name?: string | null } | null;
};

type Summary = { upcoming: number; urgent: number; total: number };

const formatDate = (value: string) => new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

export default function Index({ events, summary }: { events: CalendarEvent[]; summary: Summary }) {
    return <AppLayout title="Calendar">
        <PageFrame width="standard">
            <PageHeader
                eyebrow="Shared municipal calendar"
                title="Events, deadlines & schedules"
                description="One calendar surface for office events and domain-generated deadlines. Phase 1 begins with routed-work deadlines and expands through HR, legislative, property, and municipal events."
            />

            <section className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CalendarDays size={20} className="text-blue-800" /><div className="mt-3 text-3xl font-bold text-slate-950">{summary.upcoming}</div><div className="text-sm text-slate-500">upcoming</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><AlertTriangle size={20} className="text-rose-700" /><div className="mt-3 text-3xl font-bold text-slate-950">{summary.urgent}</div><div className="text-sm text-slate-500">high / urgent</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Clock3 size={20} className="text-slate-700" /><div className="mt-3 text-3xl font-bold text-slate-950">{summary.total}</div><div className="text-sm text-slate-500">visible events</div></div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-950">Schedule</h2></div>
                <div className="divide-y divide-slate-100">
                    {events.map((event) => <article key={event.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${event.priority === 'urgent' ? 'bg-rose-50 text-rose-700' : event.priority === 'high' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{event.priority}</span>
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{event.event_type.replaceAll('_', ' ')}</span>
                                {event.status !== 'scheduled' && <span className="text-xs font-semibold uppercase text-emerald-700">{event.status}</span>}
                            </div>
                            <div className="mt-2 font-bold text-slate-950">{event.title}</div>
                            <div className="mt-1 text-sm text-slate-500">{formatDate(event.starts_at)}{event.department ? ` · ${event.department.short_name || event.department.name}` : ''}</div>
                            {event.description && <div className="mt-1 text-xs leading-5 text-slate-400">{event.description}</div>}
                        </div>
                        {event.action_url && <Link href={event.action_url} className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-50">Open</Link>}
                    </article>)}
                    {events.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-500">No calendar events are visible yet.</div>}
                </div>
            </section>
        </PageFrame>
    </AppLayout>;
}
