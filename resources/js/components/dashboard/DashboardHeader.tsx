import { Building2, Landmark, ShieldCheck, UserRound } from 'lucide-react';
import type { DashboardExperience } from './types';

const profileCopy: Record<DashboardExperience['key'], string> = {
    employee: 'Assigned work, deadlines, correspondence, and recent activity prioritized for daily execution.',
    department_head: 'Office workload, staff accountability, unresolved work, and personal responsibilities within your approved scope.',
    executive_oversight: 'Municipal workload, bottlenecks, executive attention items, and completed work within existing executive visibility.',
    system_administration: 'Account, MFA, office identity, security, and platform-governance status without widening municipal content access.',
};

const profileIcon = {
    employee: UserRound,
    department_head: Building2,
    executive_oversight: Landmark,
    system_administration: ShieldCheck,
};

const scopeLabels: Record<keyof DashboardExperience['scopes'], string> = {
    personal: 'Personal work',
    office: 'Office accountability',
    municipal: 'Municipal oversight',
    system: 'System governance',
};

export default function DashboardHeader({ experience }: { experience: DashboardExperience }) {
    const Icon = profileIcon[experience.key];
    const visibleScopes = Object.entries(experience.scopes).filter(([, visible]) => visible) as Array<[keyof DashboardExperience['scopes'], boolean]>;

    return (
        <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-[#142236] sm:rounded-3xl">
            <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-6">
                <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300 sm:text-xs">
                        <Icon size={15} aria-hidden="true" /> {experience.label}
                    </div>
                    <h1 className="mt-1.5 break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
                        {experience.department.name}
                    </h1>
                    <p className="mt-1.5 max-w-3xl text-[11px] leading-5 text-slate-600 dark:text-slate-300 sm:text-sm sm:leading-6">
                        {profileCopy[experience.key]}
                    </p>
                </div>
                <div className="flex flex-wrap gap-1.5 lg:max-w-sm lg:justify-end" aria-label="Dashboard visibility scopes">
                    {visibleScopes.map(([scope]) => (
                        <span key={scope} className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200 sm:text-[10px]">
                            {scopeLabels[scope]}
                        </span>
                    ))}
                </div>
            </div>
        </header>
    );
}
