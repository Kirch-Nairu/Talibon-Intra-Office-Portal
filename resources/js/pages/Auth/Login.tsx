import { Head, useForm } from '@inertiajs/react';
import { Building2, LockKeyhole, ShieldCheck, UserRoundCheck } from 'lucide-react';
import type { FormEvent } from 'react';

const demoAccounts = [
    { label: 'System Administrator', office: "Mayor's Office", email: 'admin@talibon.demo', password: 'TalibonDemo2026!' },
    { label: "Mayor's Office Approver", office: "Mayor's Office", email: 'mayor@talibon.demo', password: 'TalibonDemo2026!' },
    { label: 'Engineering Department Head', office: 'Municipal Engineering Office', email: 'engineering@talibon.demo', password: 'TalibonDemo2026!' },
    { label: 'Budget Department Head', office: 'Municipal Budget Office', email: 'budget@talibon.demo', password: 'TalibonDemo2026!' },
    { label: 'HR Officer', office: 'Human Resource Management Office', email: 'hr@talibon.demo', password: 'TalibonDemo2026!' },
    { label: 'Legislative Records Staff', office: 'Sangguniang Bayan / Legislative Office', email: 'legislative@talibon.demo', password: 'TalibonDemo2026!' },
    { label: 'Employee Self-Service', office: 'Municipal Planning and Development Office', email: 'employee@talibon.demo', password: 'TalibonDemo2026!' },
];

export default function Login() {
    const form = useForm({ email: 'engineering@talibon.demo', password: 'TalibonDemo2026!', remember: false });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post('/login');
    }

    function useDemoAccount(email: string, password: string) {
        form.setData({ email, password, remember: false });
    }

    return (
        <>
            <Head title="Sign in" />
            <div className="min-h-screen bg-[#eef3f9] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
                <section className="hidden bg-[#0b2852] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
                    <div className="flex items-center gap-3"><Building2 size={32} /><div><div className="text-xs uppercase tracking-[0.25em] text-blue-200">Municipality of Talibon</div><div className="text-2xl font-bold">Intra-Office Portal</div></div></div>
                    <div className="max-w-xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/5 px-4 py-2 text-sm text-blue-100"><ShieldCheck size={17} /> Municipal operations prototype</div>
                        <h1 className="text-4xl font-bold leading-tight xl:text-5xl">One controlled workspace for municipal coordination.</h1>
                        <p className="mt-5 text-base leading-7 text-blue-100 xl:text-lg xl:leading-8">Department-aware access, inter-office routing, Mayor's Office review, central records, HR workflows, and accountable actions from one shared platform.</p>
                    </div>
                    <div className="text-sm text-blue-200">Synthetic prototype data only · No real employee or citizen records</div>
                </section>

                <section className="px-4 py-5 sm:px-6 md:px-8 lg:flex lg:items-center lg:justify-center lg:p-8 xl:p-10">
                    <div className="mx-auto w-full max-w-5xl">
                        <div className="mb-5 lg:hidden"><div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700 sm:text-xs">Municipality of Talibon</div><div className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Intra-Office Portal</div></div>

                        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
                                <div className="mb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><LockKeyhole size={19} /></div><h2 className="mt-4 text-xl font-bold text-slate-950 sm:text-2xl">Employee sign in</h2><p className="mt-1.5 text-[12px] leading-5 text-slate-500 sm:text-sm">Choose a demo identity or enter credentials manually.</p></div>
                                <form onSubmit={submit} className="space-y-4">
                                    <label className="block"><span className="mb-1.5 block text-[12px] font-medium text-slate-700 sm:text-sm">Email</span><input value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} type="email" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[13px] outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:px-4 sm:py-3 sm:text-sm" />{form.errors.email && <span className="mt-1 block text-[11px] text-red-600 sm:text-sm">{form.errors.email}</span>}</label>
                                    <label className="block"><span className="mb-1.5 block text-[12px] font-medium text-slate-700 sm:text-sm">Password</span><input value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} type="password" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[13px] outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:px-4 sm:py-3 sm:text-sm" /></label>
                                    <button disabled={form.processing} className="w-full rounded-xl bg-[#0b2852] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#10366c] disabled:opacity-60 sm:py-3 sm:text-sm">{form.processing ? 'Signing in…' : 'Sign in securely'}</button>
                                </form>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 sm:p-5">
                                <div className="flex items-center gap-2"><UserRoundCheck size={18} className="text-blue-800" /><div><h3 className="text-sm font-bold text-slate-950">Demo identities</h3><p className="text-[10px] text-slate-500 sm:text-xs">Tap an account to load its credentials.</p></div></div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {demoAccounts.map((account) => (
                                        <button
                                            key={account.email}
                                            type="button"
                                            onClick={() => useDemoAccount(account.email, account.password)}
                                            className={`rounded-xl border p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/50 ${form.data.email === account.email ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50/70'}`}
                                        >
                                            <div className="text-[11px] font-bold text-slate-950 sm:text-[12px]">{account.label}</div>
                                            <div className="mt-0.5 truncate text-[9px] text-slate-500 sm:text-[10px]">{account.office}</div>
                                            <div className="mt-2 break-all font-mono text-[9px] font-semibold text-blue-800 sm:text-[10px]">{account.email}</div>
                                            <div className="mt-1 break-all font-mono text-[9px] text-slate-500 sm:text-[10px]">Password: {account.password}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[9px] leading-4 text-amber-900 sm:text-[10px]">All identities and records on this screen are synthetic and exist only for the prototype demonstration.</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
