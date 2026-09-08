import { CalendarDays, TriangleAlert } from 'lucide-react';
import { talibonAssets } from '../../branding/talibonAssets';
import PublicPanel from './PublicPanel';
import type { NewsItem, PublicContent } from './types';

function Notice({ item, advisory = false }: { item: NewsItem; advisory?: boolean }) {
    return <article className={`rounded-lg border p-3 ${advisory ? 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100' : 'border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/50'}`}>
        <div className="flex items-center gap-2"><span className="rounded bg-[#0b2852] px-2 py-1 text-[9px] font-semibold uppercase text-white">{item.type}</span><span className="text-[10px]">{item.date}</span></div>
        <h3 className="mt-2 text-xs font-bold leading-5">{item.title}</h3><p className="mt-1 text-[11px] leading-5 opacity-80">{item.summary}</p>
    </article>;
}

export default function PublicNewsRail({ content }: { content: PublicContent }) {
    const advisories = content.news.filter((item) => item.type.toLowerCase() === 'advisory');
    const events = content.news.filter((item) => item.type.toLowerCase() === 'event');
    return <aside className="min-w-0 space-y-3" aria-label="Public advisories and events">
        <PublicPanel title="Municipal Advisories" icon={TriangleAlert}>
            <p className="mb-3 text-[10px] font-semibold text-amber-800 dark:text-amber-300">{content.sampleLabel}</p>
            <div className="space-y-2">{advisories.map((item) => <Notice key={item.title} item={item} advisory />)}{!advisories.length && <p className="text-xs text-slate-500 dark:text-slate-400">No advisory entries available.</p>}</div>
            <a href="#news" className="municipal-link mt-3 inline-block">All news and notices →</a>
        </PublicPanel>
        <PublicPanel title="Events Preview" icon={CalendarDays}>
            <p className="mb-3 text-[10px] font-semibold text-amber-800 dark:text-amber-300">{content.sampleLabel}</p>
            <div className="space-y-2">{events.map((item) => <Notice key={item.title} item={item} />)}{!events.length && <p className="text-xs text-slate-500 dark:text-slate-400">No event entries available.</p>}</div>
            <a href="#news" className="municipal-link mt-3 inline-block">View news and events →</a>
        </PublicPanel>
        <div className="relative isolate min-h-56 overflow-hidden rounded-xl bg-[#0b2852] px-5 py-6 text-white">
            <img src={talibonAssets.publicLandmark} className="municipal-photo -z-20" alt="" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b2852] via-transparent to-transparent" />
            <div className="text-xl font-black"><span className="text-lime-300">ONE</span> TALIBON.</div>
            <p className="mt-2 max-w-48 text-sm leading-5">Our people. Our home.<br />A connected municipality.</p>
            <div className="absolute bottom-3 right-3 text-[8px] uppercase tracking-wider text-blue-100">Illustrative artwork</div>
        </div>
    </aside>;
}
