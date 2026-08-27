import { Users } from 'lucide-react';
import type { StaffWorkload } from './types';

export default function StaffWorkloadTable({ rows }: { rows: StaffWorkload[] }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl" aria-labelledby="my-work-staff-workload">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5"><Users size={16} className="text-blue-700" aria-hidden="true" /><h2 id="my-work-staff-workload" className="text-sm font-bold text-slate-950 sm:text-base">Bounded staff workload</h2></div>
            <div className="hidden grid-cols-[1fr_120px_120px_140px] gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:grid">
                <div>Employee</div><div>Active</div><div>Overdue</div><div>Requires action</div>
            </div>
            <div className="divide-y divide-slate-100">
                {rows.map((row) => (
                    <div key={`${row.employee}-${row.position || ''}`} className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_120px_120px_140px] sm:items-center sm:px-5">
                        <div><div className="text-[11px] font-semibold text-slate-800 sm:text-xs">{row.employee}</div><div className="mt-1 text-[9px] text-slate-400">{row.position || 'Position not recorded'}</div></div>
                        <div className="text-[10px] text-slate-600 sm:text-xs"><span className="font-bold text-slate-950">{row.active}</span> active</div>
                        <div className="text-[10px] text-slate-600 sm:text-xs"><span className={row.overdue > 0 ? 'font-bold text-rose-700' : 'font-bold text-slate-950'}>{row.overdue}</span> overdue</div>
                        <div className="text-[10px] text-slate-600 sm:text-xs"><span className="font-bold text-blue-800">{row.requiresAction}</span> items</div>
                    </div>
                ))}
                {rows.length === 0 ? <div className="px-5 py-12 text-center text-[11px] text-slate-500">No active assigned office work.</div> : null}
            </div>
        </section>
    );
}
