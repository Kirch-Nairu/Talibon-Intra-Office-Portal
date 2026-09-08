import { Link } from '@inertiajs/react';
import { Bell, Inbox, ShieldCheck } from 'lucide-react';
import { talibonAssets } from '../../branding/talibonAssets';
import { usePortalNotifications } from '../shell/NotificationContext';
import { formatDate, humanize } from './format';
import type { CorrespondenceOverviewData, SystemOverviewData } from './types';

type Props = { correspondence?: CorrespondenceOverviewData; system?: SystemOverviewData };

export default function ActivityRail({ correspondence, system }: Props) {
    const notifications = usePortalNotifications();
    return <aside className="min-w-0 space-y-4" aria-label="Dashboard information rail">
        <section className="municipal-panel overflow-hidden">
            <h2 className="municipal-panel-title border-b border-slate-100 px-4 py-4 dark:border-slate-700">{system ? <ShieldCheck size={18} className="text-blue-600 dark:text-blue-300" /> : <Bell size={18} className="text-blue-600 dark:text-blue-300" />}{system ? 'Security activity' : 'Recent activity'}</h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {system ? system.security.recentEvents.map((event, index) => <article key={`${event.action}-${index}`} className="px-4 py-3">
                    <div className="text-xs font-semibold">{humanize(event.action)}</div>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{event.summary}</p>
                    <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{event.actor || 'System'} · {humanize(event.outcome)}</div>
                    <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{formatDate(event.createdAt)}</div>
                </article>) : notifications.map((item) => <Link key={item.key} href={item.url} className="flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.urgent ? 'bg-rose-500' : 'bg-blue-500'}`} aria-hidden="true" />
                    <div className="min-w-0"><div className="text-xs font-semibold">{item.title}</div><p className="mt-1 break-words text-xs leading-5 text-slate-600 dark:text-slate-300">{item.message}</p><div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{item.urgent && <span className="mr-2 font-semibold text-rose-700 dark:text-rose-300">For action</span>}{formatDate(item.created_at)}</div></div>
                </Link>)}
                {(system ? system.security.recentEvents.length : notifications.length) === 0 && <p className="px-4 py-7 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">{system ? 'No recent security events.' : 'You’re up to date. No recent notifications.'}</p>}
            </div>
        </section>
        {correspondence && <section className="municipal-panel p-4">
            <h2 className="municipal-panel-title"><Inbox size={18} className="text-blue-600 dark:text-blue-300" />Correspondence attention</h2>
            <Link href={correspondence.attention.link} className="mt-3 flex items-center gap-3 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"><span className="text-3xl font-bold tabular-nums">{correspondence.attention.value}</span><span className="text-xs">{correspondence.attention.label}</span></Link>
            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">{correspondence.status.map((row) => <Link key={row.lifecycle} href={row.link} className="flex justify-between gap-3 py-2.5 text-xs hover:text-blue-600 dark:hover:text-blue-300"><span>{row.label}</span><span className="font-semibold tabular-nums">{row.count}</span></Link>)}</div>
        </section>}
        <div className="relative isolate overflow-hidden rounded-xl bg-[#0b2852] p-5 text-white">
            <img src={talibonAssets.publicPromoImage} className="municipal-photo -z-20 opacity-40" alt="" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b2852] to-transparent" />
            <div className="text-lg font-bold">One Talibon.</div><p className="mt-1 text-xs leading-5 text-blue-100">Our people. Our home.<br />A connected municipality.</p>
        </div>
    </aside>;
}
