import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, Building2, FileText, Gavel, LayoutDashboard, LogOut, Menu, ShieldCheck, Users, X } from 'lucide-react';
import { PropsWithChildren, useEffect, useState } from 'react';
import type { SharedProps } from '../types';

type Props = PropsWithChildren<{ title: string }>;

export default function AppLayout({ title, children }: Props) {
    const { auth, pendingMemo, unreadMemoCount } = usePage<SharedProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dismissedMemoId, setDismissedMemoId] = useState<number | null>(null);
    const user = auth.user;
    const isMayor = ['system_admin', 'mayor_approver', 'mayor_staff'].includes(user?.role ?? '');
    const canAudit = ['system_admin', 'mayor_approver'].includes(user?.role ?? '');

    useEffect(() => {
        const timer = window.setInterval(() => router.reload({ only: ['pendingMemo', 'unreadMemoCount'], preserveState: true, preserveScroll: true }), 5000);
        return () => window.clearInterval(timer);
    }, []);

    const nav = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
        { label: 'My Work', href: '/transactions', icon: FileText, show: true },
        { label: "Mayor's Office", href: '/mayor-office', icon: Building2, show: isMayor },
        { label: 'Memoranda', href: '/memoranda', icon: FileText, show: true },
        { label: 'Legislation', href: '/legislation', icon: Gavel, show: true },
        { label: 'HRIS', href: '/hris', icon: Users, show: true },
        { label: 'Audit & Security', href: '/audit', icon: ShieldCheck, show: canAudit },
    ].filter((item) => item.show);

    const sidebar = <div className="flex h-full flex-col bg-[#0b2852] text-white"><div className="border-b border-white/10 px-6 py-6"><div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">Municipality of Talibon</div><div className="mt-2 text-xl font-bold">Intra-Office Portal</div><div className="mt-1 text-xs text-blue-200">Prototype Environment</div></div><nav className="flex-1 space-y-1 px-3 py-5">{nav.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"><Icon size={18} /><span>{label}</span>{label === 'Memoranda' && unreadMemoCount > 0 && <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">{unreadMemoCount}</span>}</Link>)}</nav><div className="border-t border-white/10 p-4"><div className="rounded-xl bg-white/10 p-3"><div className="truncate text-sm font-semibold">{user?.name}</div><div className="mt-1 truncate text-xs text-blue-200">{user?.employee?.department?.name}</div><div className="truncate text-xs text-blue-300">{user?.employee?.position}</div></div><button onClick={() => router.post('/logout')} className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-blue-100 hover:bg-white/10"><LogOut size={16} /> Sign out</button></div></div>;

    const showMemo = pendingMemo && dismissedMemoId !== pendingMemo.id;
    return <><Head title={title} /><div className="min-h-screen lg:grid lg:grid-cols-[270px_1fr]"><aside className="hidden h-screen lg:sticky lg:top-0 lg:block">{sidebar}</aside>{mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /><aside className="relative h-full w-[82%] max-w-[290px] shadow-2xl">{sidebar}</aside><button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 rounded-full bg-white p-2 text-slate-900"><X size={20} /></button></div>}<main className="min-w-0"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-8"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-700 lg:hidden"><Menu size={22} /></button><div><div className="text-sm font-semibold text-slate-950">{title}</div><div className="hidden text-xs text-slate-500 sm:block">{user?.employee?.department?.short_name || user?.employee?.department?.name}</div></div></div><div className="flex items-center gap-3"><Link href="/memoranda" className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"><Bell size={19} />{unreadMemoCount > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[10px] font-bold text-white">{unreadMemoCount}</span>}</Link><div className="hidden rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-800 sm:block">{user?.role?.replaceAll('_', ' ')}</div></div></header><div className="p-4 md:p-8">{children}</div></main></div>{showMemo && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8"><div className="flex items-start justify-between gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-800"><Bell /></div><button onClick={() => setDismissedMemoId(pendingMemo.id)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={19} /></button></div><div className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">New Memorandum · {pendingMemo.memo_number}</div><h2 className="mt-2 text-2xl font-bold text-slate-950">{pendingMemo.title}</h2><p className="mt-3 text-sm text-slate-500">Issued by {pendingMemo.department || pendingMemo.issuer || "Mayor's Office"}. {pendingMemo.requires_acknowledgement ? 'Acknowledgement is required.' : 'Please review this issuance.'}</p><div className="mt-7 flex justify-end gap-3"><button onClick={() => setDismissedMemoId(pendingMemo.id)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Later</button><Link href={`/memoranda/${pendingMemo.id}`} className="rounded-xl bg-[#0b2852] px-5 py-2.5 text-sm font-semibold text-white">Open memorandum</Link></div></div></div>}</>;
}
