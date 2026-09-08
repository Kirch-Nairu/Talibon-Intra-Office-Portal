import { Bookmark, Building2, FileCheck2, FileText, Megaphone, ShieldCheck, Users } from 'lucide-react';
import PublicPanel from './PublicPanel';
import type { PublicContent } from './types';

const serviceIcons = [FileCheck2, Users, FileText, Megaphone, Building2, ShieldCheck];

export default function PublicServices({ content }: { content: PublicContent }) {
    return <PublicPanel id="services" title="Quick Services" icon={Bookmark}>
        <p className="mb-3 text-sm leading-5 text-slate-500 dark:text-slate-400">Municipal service guidance · Information only</p>
        <div className="grid grid-cols-1 gap-x-6 @min-[480px]:grid-cols-2 @min-[850px]:grid-cols-3">
            {content.services.map((service, index) => {
                const Icon = serviceIcons[index % serviceIcons.length];
                return <article key={service.title} className="border-b border-slate-200 py-4 dark:border-slate-700">
                    <div className="flex items-start gap-2.5"><Icon size={24} className="shrink-0 text-[#1769aa] dark:text-blue-300" aria-hidden="true" /><h3 className="text-sm font-semibold leading-5">{service.title}</h3></div>
                    <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-400">{service.description}</p>
                    <div className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-300">{service.status}</div>
                </article>;
            })}
        </div>
        <a href="#contact" className="municipal-link mt-3 inline-block">Municipal contact information →</a>
    </PublicPanel>;
}
