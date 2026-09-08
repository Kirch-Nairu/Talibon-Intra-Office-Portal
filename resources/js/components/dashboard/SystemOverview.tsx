import { Link } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import type { SystemOverviewData } from './types';

export default function SystemOverview({ overview }: { overview: SystemOverviewData }) {
    return <section className="municipal-panel p-5" aria-labelledby="dashboard-system-overview">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="dashboard-system-overview" className="municipal-panel-title"><KeyRound size={20} className="text-[#1769aa] dark:text-blue-300" />Office identities</h2>
            <Link href="/admin" className="municipal-link">Accounts & Access →</Link>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4">
            <div><dt className="text-sm text-slate-600 dark:text-slate-300">Configured</dt><dd className="mt-1 text-2xl font-bold tabular-nums">{overview.officeIdentityStatus.configured}</dd></div>
            <div><dt className="text-sm text-slate-600 dark:text-slate-300">Pending</dt><dd className="mt-1 text-2xl font-bold tabular-nums">{overview.officeIdentityStatus.pending}</dd></div>
        </dl>
    </section>;
}
