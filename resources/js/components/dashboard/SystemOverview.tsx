import { Link } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import type { SystemOverviewData } from './types';

export default function SystemOverview({ overview }: { overview: SystemOverviewData }) {
    const security = [
        ['Privileged accounts', overview.security.privilegedAccounts],
        ['MFA enrolled', overview.security.mfaEnrolled],
        ['Inactive accounts', overview.security.inactiveAccounts],
    ] as const;
    return <section className="space-y-4" aria-labelledby="dashboard-system-overview">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="dashboard-system-overview" className="text-sm font-bold">Identity and security posture</h2><Link href="/admin" className="municipal-link">Accounts & Access →</Link></div>
        <div className="municipal-panel p-4">
            <h3 className="municipal-panel-title"><KeyRound size={18} className="text-blue-600 dark:text-blue-300" />Office identity registry</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><div className="text-3xl font-bold">{overview.officeIdentityStatus.configured}</div><div className="mt-1 text-xs">Configured</div></div>
                <div className="rounded-lg bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"><div className="text-3xl font-bold">{overview.officeIdentityStatus.pending}</div><div className="mt-1 text-xs">Pending</div></div>
            </div>
        </div>
        <div className="municipal-panel p-4">
            <h3 className="municipal-panel-title"><ShieldCheck size={18} className="text-blue-600 dark:text-blue-300" />Account security</h3>
            <dl className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">{security.map(([label, value]) => <div key={label} className="flex justify-between gap-3 py-3 text-xs"><dt className="text-slate-600 dark:text-slate-300">{label}</dt><dd className="font-bold tabular-nums">{value}</dd></div>)}</dl>
            <Link href="/audit" className="municipal-link mt-3 inline-block">Open Audit & Security →</Link>
        </div>
    </section>;
}
