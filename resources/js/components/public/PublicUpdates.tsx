import { Building2, FileText, Megaphone } from 'lucide-react';
import PublicPanel from './PublicPanel';
import type { PublicContent } from './types';

export default function PublicUpdates({ content }: { content: PublicContent }) {
    return <div className="grid items-start gap-3 lg:grid-cols-3">
        <PublicPanel id="news" title="Latest Announcements" icon={Megaphone}>
            <div className="mb-2 text-[9px] font-semibold text-amber-800 dark:text-amber-300">{content.sampleLabel}</div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">{content.news.map((item) => <article key={`${item.type}-${item.title}`} className="py-3 first:pt-1">
                <div className="text-[9px] font-semibold uppercase text-blue-700 dark:text-blue-300">{item.type} · {item.date}</div>
                <h3 className="mt-1 text-xs font-bold leading-5">{item.title}</h3><p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-400">{item.summary}</p>
            </article>)}</div>
            {!content.news.length && <p className="text-xs text-slate-500 dark:text-slate-400">No announcement entries available.</p>}
        </PublicPanel>
        <PublicPanel id="projects" title="Projects & Programs" icon={Building2}>
            <div className="mb-2 text-[9px] font-semibold text-amber-800 dark:text-amber-300">{content.sampleLabel}</div>
            <div className="space-y-2">{content.projects.map((item) => <article key={item.title} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="text-[9px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">{item.tag}</div>
                <h3 className="mt-1 text-xs font-bold leading-5">{item.title}</h3><p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-400">{item.summary}</p>
            </article>)}</div>
            {!content.projects.length && <p className="text-xs text-slate-500 dark:text-slate-400">No project previews available.</p>}
        </PublicPanel>
        <PublicPanel id="transparency" title="Transparency & Public Documents" icon={FileText}>
            <div className="mb-2 text-[9px] font-semibold text-amber-800 dark:text-amber-300">{content.sampleLabel}</div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">{content.transparency.map((item) => <article key={item.label} className="flex items-start gap-2 py-3">
                <FileText size={17} className="mt-0.5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                <div><h3 className="text-xs font-semibold">{item.label}</h3><div className="mt-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">{item.value}</div><p className="mt-1 text-[10px] leading-5 text-slate-500 dark:text-slate-400">{item.note}</p></div>
            </article>)}</div>
            <p className="mt-2 border-t border-slate-200 pt-3 text-[10px] leading-5 text-slate-500 dark:border-slate-700 dark:text-slate-400">Public document library preview. Downloadable documents will appear when published.</p>
        </PublicPanel>
    </div>;
}
