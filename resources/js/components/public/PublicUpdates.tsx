import { Building2, FileText, Megaphone } from 'lucide-react';
import PublicPanel from './PublicPanel';
import type { PublicContent } from './types';

export default function PublicUpdates({ content }: { content: PublicContent }) {
    const announcements = content.news.filter((item) => !['advisory', 'event'].includes(item.type.toLowerCase()));
    return <div className="public-updates">
        <PublicPanel id="news" title="Announcements" icon={Megaphone}>

            <div className="divide-y divide-slate-200 dark:divide-slate-700">{announcements.map((item) => <article key={`${item.type}-${item.title}`} className="py-2 first:pt-0">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">{item.type} · {item.date}</div>
                <h3 className="mt-1 text-sm font-semibold leading-5">{item.title}</h3><p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-400">{item.summary}</p>
            </article>)}</div>
            {!announcements.length && <p className="text-xs text-slate-500 dark:text-slate-400">No announcement entries available.</p>}
        </PublicPanel>
        <PublicPanel id="projects" title="Projects & Programs" icon={Building2}>

            <div className="space-y-0">{content.projects.map((item) => <article key={item.title} className="border-b border-slate-200 py-2 first:pt-0 last:border-0 dark:border-slate-700">

                <h3 className="mt-1 text-sm font-semibold leading-5">{item.title}</h3><p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">{item.summary}</p>
            </article>)}</div>
            {!content.projects.length && <p className="text-xs text-slate-500 dark:text-slate-400">No project previews available.</p>}
        </PublicPanel>
        <PublicPanel id="transparency" title="Transparency & Public Documents" icon={FileText}>

            <div className="divide-y divide-slate-200 dark:divide-slate-700">{content.transparency.map((item) => <article key={item.label} className="flex items-start gap-2 py-2">
                <FileText size={17} className="mt-0.5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                <div><h3 className="text-xs font-semibold">{item.label}</h3><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.note}</p></div>
            </article>)}</div>
            <p className="public-panel-note">Sample library · No published downloads</p>
        </PublicPanel>
    </div>;
}
