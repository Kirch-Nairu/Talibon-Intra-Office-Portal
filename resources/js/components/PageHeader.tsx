import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    eyebrow: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    aside?: ReactNode;
    icon?: LucideIcon;
};

export default function PageHeader({ eyebrow, title, description, aside, icon: Icon }: Props) {
    return (
        <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-[#142236] sm:rounded-3xl">
            <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:gap-6 lg:p-7">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300 sm:text-xs">
                        {Icon && <Icon size={15} aria-hidden="true" />}
                        <span>{eyebrow}</span>
                    </div>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 max-w-3xl text-[12px] leading-5 text-slate-600 dark:text-slate-300 sm:text-sm sm:leading-6">
                            {description}
                        </p>
                    )}
                </div>
                {aside && <div className="w-full shrink-0 lg:w-auto lg:max-w-sm">{aside}</div>}
            </div>
        </header>
    );
}
