import { Bookmark, Building2, FileCheck2, FileText, Megaphone, ShieldCheck, Users } from 'lucide-react';
import PublicPanel from './PublicPanel';
import type { PublicContent } from './types';

const serviceIcons = [FileCheck2, Users, FileText, Megaphone, Building2, ShieldCheck];
const colors = ['text-blue-700 dark:text-blue-300', 'text-emerald-700 dark:text-emerald-300', 'text-amber-700 dark:text-amber-300'];

export default function PublicServices({ content }: { content: PublicContent }) {
    return <PublicPanel id="services" title="Quick Services" icon={Bookmark}>
        <p className="mb-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">Municipal service guidance · Information only</p>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 @min-[650px]:grid-cols-3">
            {content.services.map((service, index) => {
                const Icon = serviceIcons[index % serviceIcons.length];
                return <article key={service.title} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="flex items-start gap-2.5"><Icon size={24} className={`shrink-0 ${colors[index % colors.length]}`} aria-hidden="true" /><h3 className="text-xs font-bold leading-4">{service.title}</h3></div>
                    <p className="mt-2 text-[10px] leading-4 text-slate-600 dark:text-slate-400">{service.description}</p>
                    <div className="mt-2 text-[9px] font-semibold text-blue-700 dark:text-blue-300">{service.status}</div>
                </article>;
            })}
        </div>
        <a href="#contact" className="municipal-link mt-3 inline-block">Municipal contact information →</a>
    </PublicPanel>;
}
