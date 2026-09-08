import { usePage } from '@inertiajs/react';
import { talibonAssets } from '../../branding/talibonAssets';
import type { SharedProps } from '../../types';
import MunicipalContext from './MunicipalContext';
import type { DashboardExperience } from './types';

const profileCopy = {
    employee: 'Here’s the work currently assigned to you.',
    department_head: 'Review your office workload and items requiring action.',
    executive_oversight: 'Review municipal workload and items requiring executive attention.',
    system_administration: 'Review account access, security, and platform status.',
};

export default function DashboardHeader({ experience }: { experience: DashboardExperience }) {
    const { auth } = usePage<SharedProps>().props;
    const name = auth.user?.name.trim().replace(/^(?:(?:Engr|Dr|Atty|Mr|Mrs|Ms)\.?\s+)+/i, '').split(/\s+/)[0];
    return <div className="space-y-3">
        <header className="relative isolate flex min-h-40 min-w-0 items-center overflow-hidden rounded-2xl bg-[#0b2852] text-white sm:min-h-44">
            <img src={talibonAssets.internalHero} alt="" className="municipal-photo -z-20 opacity-25" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071e3d] to-[#0b2852]/40" />
            <div className="w-full px-5 py-6 sm:px-6">
                <h1 className="break-words text-[26px] font-bold leading-tight tracking-tight sm:text-[32px]">Welcome{name ? ', ' + name : ''}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50">{profileCopy[experience.key]}</p>
                <p className="mt-3 text-xs text-blue-100">{experience.department.name}</p>
            </div>
        </header>
        <MunicipalContext />
    </div>;
}
