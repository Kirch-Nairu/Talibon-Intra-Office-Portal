import { Link, router, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock3, Radio, RotateCcw, Send } from 'lucide-react';
import { useEffect } from 'react';
import AppLayout from '../../layouts/AppLayout';

type Dept = { id: number; code: string; name: string; short_name?: string };
type Event = {
    id: number;
    action: string;
    previous_status?: string;
    new_status?: string;
    remarks?: string;
    created_at: string;
    actor: { name: string; employee?: { department?: Dept } };
    from_department?: Dept;
    to_department?: Dept;
};
type Tx = {
    id: number;
    reference_no: string;
    title: string;
    description?: string;
    transaction_type: string;
    priority: string;
    status: string;
    created_at: string;
    origin_department: Dept;
    current_department: Dept;
    creator: { name: string };
    events: Event[];
};

export default function Show({ transaction: tx, departments, permissions }: { transaction: Tx; departments: Dept[]; permissions: { canTransition: boolean; canMayorDecision: boolean } }) {
    const form = useForm<{ action: string; target_department_id: number | ''; remarks: string }>({
        action: 'mark_review',
        target_department_id: '',
        remarks: '',
    });

    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState !== 'visible' || form.processing) {
                return;
            }

            router.reload({
                only: ['transaction', 'permissions'],
                preserveScroll: true,
                preserveState: true,
            });
        };

        const timer = window.setInterval(refresh, 2000);
        window.addEventListener('focus', refresh);

        return () => {
            window.clearInterval(timer);
            window.removeEventListener('focus', refresh);
        };
    }, [form.processing]);

    const transition = (action: string) => {
        form.transform((data) => ({ ...data, action })).post(`/transactions/${tx.id}/transition`, {
            preserveScroll: true,
            onSuccess: () => form.reset('remarks'),
        });
    };

    return (
        <AppLayout title={tx.reference_no}>
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <Link href="/transactions" className="text-[12px] font-semibold text-blue-700 sm:text-sm">← Back to My Work</Link>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
                        <Radio size={12} className="animate-pulse sm:h-[14px] sm:w-[14px]" />
                        Live status
                    </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
                    <div className="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700 sm:text-xs sm:tracking-[0.18em]">{tx.reference_no}</div>
                            <h1 className="mt-1.5 text-2xl font-bold leading-tight text-slate-950 sm:mt-2 sm:text-3xl">{tx.title}</h1>
                            <p className="mt-2 max-w-3xl text-[12px] leading-5 text-slate-600 sm:mt-3 sm:text-sm sm:leading-6">{tx.description || 'No additional description.'}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase text-slate-700 sm:px-3 sm:py-1.5 sm:text-xs">{tx.status.replaceAll('_', ' ')}</span>
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase text-amber-800 sm:px-3 sm:py-1.5 sm:text-xs">{tx.priority}</span>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:mt-7 sm:gap-4 sm:pt-6 sm:grid-cols-3">
                        <div><div className="text-[9px] uppercase text-slate-400 sm:text-xs">Origin</div><div className="mt-1 text-[13px] font-semibold text-slate-900 sm:text-base">{tx.origin_department.name}</div></div>
                        <div><div className="text-[9px] uppercase text-slate-400 sm:text-xs">Current Office</div><div className="mt-1 text-[13px] font-semibold text-blue-800 sm:text-base">{tx.current_department.name}</div></div>
                        <div><div className="text-[9px] uppercase text-slate-400 sm:text-xs">Created by</div><div className="mt-1 text-[13px] font-semibold text-slate-900 sm:text-base">{tx.creator.name}</div></div>
                    </div>
                </section>

                {(permissions.canTransition || permissions.canMayorDecision) && (
                    <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:rounded-3xl sm:p-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-950 sm:text-base"><Send size={16} className="sm:h-[18px] sm:w-[18px]" /> Workflow actions</div>
                        <textarea value={form.data.remarks} onChange={(e) => form.setData('remarks', e.target.value)} rows={2} className="mt-3 w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-[12px] sm:mt-4 sm:px-4 sm:py-3 sm:text-sm" placeholder="Review note / routing remarks" />
                        {permissions.canTransition && (
                            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
                                <button onClick={() => transition('mark_review')} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-[12px] font-semibold text-blue-900 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"><Clock3 className="mr-1.5 inline" size={14} />Mark for Review</button>
                                <button onClick={() => transition('send_to_mayor')} className="rounded-lg bg-[#0b2852] px-3 py-2 text-[12px] font-semibold text-white sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm">Send to Mayor's Office</button>
                                <button onClick={() => transition('return_origin')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"><RotateCcw className="mr-1.5 inline" size={14} />Return to Origin</button>
                                <div className="flex min-w-0 basis-full gap-2 sm:min-w-[280px] sm:flex-1 sm:basis-auto">
                                    <select value={form.data.target_department_id} onChange={(e) => form.setData('target_department_id', Number(e.target.value))} className="min-w-0 flex-1 rounded-lg border border-blue-200 bg-white px-2.5 py-2 text-[12px] sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm">
                                        <option value="">Forward to department…</option>
                                        {departments.filter((d) => d.id !== tx.current_department.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    <button disabled={!form.data.target_department_id} onClick={() => transition('forward')} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-[12px] font-semibold text-blue-900 disabled:opacity-40 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm">Forward</button>
                                </div>
                            </div>
                        )}
                        {permissions.canMayorDecision && (
                            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
                                <button onClick={() => transition('approve')} className="rounded-lg bg-emerald-700 px-3.5 py-2 text-[12px] font-semibold text-white sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"><CheckCircle2 className="mr-1.5 inline" size={14} />Approve</button>
                                <button onClick={() => transition('disapprove')} className="rounded-lg bg-rose-700 px-3.5 py-2 text-[12px] font-semibold text-white sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm">Disapprove</button>
                                <button onClick={() => transition('request_information')} className="rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-blue-900 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm">Request Information</button>
                            </div>
                        )}
                    </section>
                )}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-5">
                        <h2 className="text-sm font-bold text-slate-950 sm:text-base">Routing history</h2>
                        <p className="mt-1 text-[10px] text-slate-500 sm:text-sm">Append-only workflow evidence · updates automatically</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {tx.events.map((event) => (
                            <div key={event.id} className="grid gap-2.5 px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-5 md:grid-cols-[32px_1fr_180px]">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-800 sm:h-8 sm:w-8"><ArrowRight size={14} className="sm:h-[15px] sm:w-[15px]" /></div>
                                <div>
                                    <div className="text-[13px] font-semibold text-slate-950 sm:text-base">{event.action.replaceAll('_', ' ')}</div>
                                    <div className="mt-1 text-[11px] text-slate-600 sm:text-sm">{event.from_department?.short_name || event.from_department?.name || '—'} → {event.to_department?.short_name || event.to_department?.name || '—'}</div>
                                    {event.remarks && <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm">{event.remarks}</div>}
                                    <div className="mt-2 text-[9px] text-slate-400 sm:text-xs">By {event.actor.name}</div>
                                </div>
                                <div className="text-[9px] text-slate-500 sm:text-xs md:text-right">{new Date(event.created_at).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
