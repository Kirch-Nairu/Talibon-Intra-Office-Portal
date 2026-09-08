import { usePage } from '@inertiajs/react';
import { Building2, Landmark, ShieldCheck, UserRound } from 'lucide-react';
import { talibonAssets } from '../../branding/talibonAssets';
import type { SharedProps } from '../../types';
import MunicipalContext from './MunicipalContext';
import type { DashboardExperience } from './types';

const profileCopy = {
    employee: 'Your work, your next steps. A more connected working day.',
    department_head: 'Keep your office moving. Coordinate people, priorities, and follow-ups.',
    executive_oversight: 'A clear view of municipal priorities. Turn attention into action.',
    system_administration: 'Support the people behind the portal. Manage identity, access, and security.',
};
const profileIcon = { employee: UserRound, department_head: Building2, executive_oversight: Landmark, system_administration: ShieldCheck };
const scopeLabels = { personal: 'Personal work', office: 'Office accountability', municipal: 'Municipal oversight', system: 'System governance' };

export default function DashboardHeader({ experience }: { experience: DashboardExperience }) {
    const { auth } = usePage<SharedProps>().props;
    const Icon = profileIcon[experience.key];
    const name = auth.user?.name.trim();
    return <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        <header className="relative isolate flex min-h-56 min-w-0 items-end overflow-hidden rounded-xl bg-[#0b2852] text-white sm:min-h-60">
            <img src={talibonAssets.internalHero} alt="" className="municipal-photo -z-20" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#082d4d]/95 via-[#083950]/80 to-[#0b2852]/30" />
            <div className="w-full px-5 py-6 sm:px-7">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-blue-100"><Icon size={15} />{experience.label}</div>
                <h1 className="mt-3 break-words text-2xl font-bold tracking-tight sm:text-4xl">Welcome{name ? `, ${name}` : ''}!</h1>
                <p className="mt-2 max-w-xl text-xs leading-5 text-blue-50 sm:text-sm">{profileCopy[experience.key]}</p>
                <div className="mt-4 border-t border-amber-200/70 pt-3">
                    <div className="text-xs font-semibold">{experience.department.name}</div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] uppercase tracking-widest text-blue-100" aria-label="Dashboard visibility scopes">
                        {Object.entries(experience.scopes).filter(([, visible]) => visible).map(([key]) => <span key={key}>{scopeLabels[key as keyof typeof scopeLabels]}</span>)}
                    </div>
                </div>
            </div>
        </header>
        <MunicipalContext />
    </div>;
}
