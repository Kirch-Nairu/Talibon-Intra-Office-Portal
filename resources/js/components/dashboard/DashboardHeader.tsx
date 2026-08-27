import { Building2, Landmark, ShieldCheck, UserRound } from 'lucide-react';
import type { DashboardExperience } from './types';

const profileCopy: Record<DashboardExperience['key'], string> = {
    employee: 'Your assigned work, deadlines, correspondence, and recent activity in one focused view.',
    department_head: 'Personal responsibilities and bounded office accountability, separated into clear operational scopes.',
    executive_oversight: 'Authorized municipal aggregates, executive approvals, bottlenecks, and unresolved work without expanding correspondence access.',
    system_administration: 'Identity, account, MFA, office digital identity, audit, and security posture for platform governance.',
};

const profileIcon = {
    employee: UserRound,
    department_head: Building2,
    executive_oversight: Landmark,
    system_administration: ShieldCheck,
};

export default function DashboardHeader({ experience }: { experience: DashboardExperience }) {
    const Icon = profileIcon[experience.key];
    const visibleScopes = Object.entries(experience.scopes).filter(([, visible]) => visible);

    return (
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                    <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">
                        <Icon size={16} aria-hidden="true" /> {experience.label}
                    </div>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        {experience.department.name}
                    </h1>
                    <p className="mt-2 max-w-3xl text-[11px] leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        {profileCopy[experience.key]}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:max-w-64 lg:justify-end">
                    {visibleScopes.map(([scope]) => (
                        <span key={scope} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-blue-800 sm:text-[10px]">
                            {scope} scope
                        </span>
                    ))}
                </div>
            </div>
        </header>
    );
}
