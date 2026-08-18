import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '../../layouts/AppLayout';

type Department = { id: number; code: string; name: string; short_name?: string };

export default function Create({ departments }: { departments: Department[] }) {
    const form = useForm({
        transaction_type: 'funding_request',
        title: '',
        description: '',
        priority: 'normal',
        target_department_id: departments[0]?.id ?? '',
        due_at: '',
        remarks: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/transactions');
    }

    return (
        <AppLayout title="New Transaction">
            <div className="mx-auto max-w-3xl">
                <div className="mb-4 sm:mb-6">
                    <Link href="/transactions" className="text-[12px] font-semibold text-blue-700 sm:text-sm">← Back to My Work</Link>
                    <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:mt-3 sm:text-3xl">Create and route transaction</h1>
                    <p className="mt-2 text-[12px] leading-5 text-slate-500 sm:text-sm sm:leading-6">The origin office is taken from your authenticated employee profile. Submission creates the first immutable routing event and starts office aging.</p>
                </div>

                <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:space-y-6 sm:rounded-3xl sm:p-6 md:p-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label><span className="mb-1.5 block text-[12px] font-semibold text-slate-700 sm:text-sm">Transaction type</span><select value={form.data.transaction_type} onChange={(e) => form.setData('transaction_type', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[12px] sm:px-4 sm:py-3 sm:text-sm"><option value="funding_request">Funding Request</option><option value="project_endorsement">Project Endorsement</option><option value="document_review">Document Review</option><option value="internal_request">Internal Request</option><option value="other">Other</option></select></label>
                        <label><span className="mb-1.5 block text-[12px] font-semibold text-slate-700 sm:text-sm">Priority</span><select value={form.data.priority} onChange={(e) => form.setData('priority', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[12px] sm:px-4 sm:py-3 sm:text-sm"><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
                    </div>

                    <label className="block"><span className="mb-1.5 block text-[12px] font-semibold text-slate-700 sm:text-sm">Title</span><input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[12px] sm:px-4 sm:py-3 sm:text-sm" placeholder="e.g. Road Rehabilitation Funding Request" />{form.errors.title && <span className="mt-1 block text-[11px] text-red-600 sm:text-sm">{form.errors.title}</span>}</label>

                    <label className="block"><span className="mb-1.5 block text-[12px] font-semibold text-slate-700 sm:text-sm">Description</span><textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[12px] sm:px-4 sm:py-3 sm:text-sm" /></label>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block"><span className="mb-1.5 block text-[12px] font-semibold text-slate-700 sm:text-sm">Send to department</span><select value={form.data.target_department_id} onChange={(e) => form.setData('target_department_id', Number(e.target.value))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[12px] sm:px-4 sm:py-3 sm:text-sm">{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>{form.errors.target_department_id && <span className="mt-1 block text-[11px] text-red-600 sm:text-sm">{form.errors.target_department_id}</span>}</label>
                        <label className="block"><span className="mb-1.5 block text-[12px] font-semibold text-slate-700 sm:text-sm">Requested due date</span><input type="date" value={form.data.due_at} onChange={(e) => form.setData('due_at', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[12px] sm:px-4 sm:py-3 sm:text-sm" />{form.errors.due_at && <span className="mt-1 block text-[11px] text-red-600 sm:text-sm">{form.errors.due_at}</span>}<span className="mt-1 block text-[9px] text-slate-400 sm:text-xs">Leave blank to use the priority-based default deadline.</span></label>
                    </div>

                    <label className="block"><span className="mb-1.5 block text-[12px] font-semibold text-slate-700 sm:text-sm">Routing remarks</span><textarea value={form.data.remarks} onChange={(e) => form.setData('remarks', e.target.value)} rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[12px] sm:px-4 sm:py-3 sm:text-sm" placeholder="Purpose or instructions for the receiving office" /></label>

                    <div className="flex justify-end gap-2 sm:gap-3"><Link href="/transactions" className="rounded-xl border border-slate-300 px-4 py-2.5 text-[12px] font-semibold text-slate-700 sm:px-5 sm:py-3 sm:text-sm">Cancel</Link><button disabled={form.processing} className="rounded-xl bg-[#0b2852] px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-60 sm:px-5 sm:py-3 sm:text-sm">{form.processing ? 'Routing…' : 'Create & Route'}</button></div>
                </form>
            </div>
        </AppLayout>
    );
}
