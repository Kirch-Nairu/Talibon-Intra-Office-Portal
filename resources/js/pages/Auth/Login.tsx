import { Head, useForm } from '@inertiajs/react';
import { Building2, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';

export default function Login() {
    const form = useForm({ email: 'engineering@talibon.demo', password: 'TalibonDemo2026!', remember: false });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post('/login');
    }

    return (
        <>
            <Head title="Sign in" />
            <div className="grid min-h-screen bg-[#eef3f9] lg:grid-cols-[1.05fr_.95fr]">
                <section className="hidden bg-[#0b2852] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="flex items-center gap-3"><Building2 size={34} /><div><div className="text-xs uppercase tracking-[0.25em] text-blue-200">Municipality of Talibon</div><div className="text-2xl font-bold">Intra-Office Portal</div></div></div>
                    <div className="max-w-xl">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/5 px-4 py-2 text-sm text-blue-100"><ShieldCheck size={17} /> Secure municipal workflow prototype</div>
                        <h1 className="text-5xl font-bold leading-tight">One internal workspace for accountable municipal coordination.</h1>
                        <p className="mt-6 text-lg leading-8 text-blue-100">Department-aware access, inter-office routing, Mayor's Office review, memoranda, legislative records, and HR workflows from one controlled platform.</p>
                    </div>
                    <div className="text-sm text-blue-200">Prototype data only · No real employee or citizen records</div>
                </section>
                <section className="flex items-center justify-center p-6 md:p-12">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 md:p-9">
                        <div className="mb-8 lg:hidden"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Municipality of Talibon</div><div className="mt-1 text-2xl font-bold text-slate-950">Intra-Office Portal</div></div>
                        <div className="mb-8"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-800"><LockKeyhole /></div><h2 className="mt-5 text-2xl font-bold text-slate-950">Employee sign in</h2><p className="mt-2 text-sm leading-6 text-slate-500">Use a department demo account to enter its authorized workspace.</p></div>
                        <form onSubmit={submit} className="space-y-5">
                            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Email</span><input value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} type="email" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />{form.errors.email && <span className="mt-1 block text-sm text-red-600">{form.errors.email}</span>}</label>
                            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Password</span><input value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} type="password" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" /></label>
                            <button disabled={form.processing} className="w-full rounded-xl bg-[#0b2852] px-4 py-3 font-semibold text-white transition hover:bg-[#10366c] disabled:opacity-60">{form.processing ? 'Signing in…' : 'Sign in securely'}</button>
                        </form>
                        <div className="mt-7 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong>Demo password:</strong> TalibonDemo2026!<br />Try engineering@talibon.demo, budget@talibon.demo, mayor@talibon.demo, hr@talibon.demo, or legislative@talibon.demo.</div>
                    </div>
                </section>
            </div>
        </>
    );
}
