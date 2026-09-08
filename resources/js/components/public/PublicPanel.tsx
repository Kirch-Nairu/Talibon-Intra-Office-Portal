import type { LucideIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{ id?: string; title: string; icon: LucideIcon; className?: string; sampleLabel?: string }>;

export function SampleLabel({ label }: { label: string }) {
    return <span className="inline-block rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{label}</span>;
}

export default function PublicPanel({ id, title, icon: Icon, className = '', sampleLabel, children }: Props) {
    return <section id={id} className={`municipal-panel p-4 ${className}`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="municipal-panel-title text-[#0b2852] dark:text-blue-100"><Icon size={18} className="shrink-0" aria-hidden="true" />{title}</h2>
            {sampleLabel && <SampleLabel label={sampleLabel} />}
        </div>
        {children}
    </section>;
}
