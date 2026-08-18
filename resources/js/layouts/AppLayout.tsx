import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, FileText, Gavel, LayoutDashboard, LogOut, Menu, ShieldCheck, Users, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import type { SharedProps } from '../types';

type Props = PropsWithChildren<{ title: string }>;

export default function AppLayout({ title, children }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const user = auth.user;

    const nav = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'My Work', href: '#', icon: FileText },
        { label: 'Memoranda', href: '#', icon: FileText },
        { label: 'Legislation', href: '#', icon: Gavel },
        { label: 'HRIS', href: '#', icon: Users },
        { label: 'Departments', href: '#', icon: Building2 },
        { label: 'Audit & Security', href: '#', icon: ShieldCheck },
    ];

    const sidebar = (
        <div className="flex h-full flex-col bg-[#0b2852] text-white">
            <div className="border-b border-white/10 px-6 py-6">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">Municipality of Talibon</div>
                <div className="mt-2 text-xl font-bold">Intra-Office Portal</div>
                <div className="mt-1 text-xs text-blue-200">Prototype Environment</div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-5">
                {nav.map(({ label, href, icon: Icon }) => (
                    <Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${href === '/dashboard' ? 'bg-white/12 text-white' : 'text-blue-100 hover:bg-white/8'}`}>
                        <Icon size={18} />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>
            <div className="border-t border-white/10 p-4">
                <div className="rounded-xl bg-white/8 p-3">
                    <div className="truncate text-sm font-semibold">{user?.name}</div>
                    <div className="mt-1 truncate text-xs text-blue-200">{user?.employee?.department?.name}</div>
                    <div className="truncate text-xs text-blue-300">{user?.employee?.position}</div>
                </div>
                <button onClick={() => router.post('/logout')} className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-blue-100 hover:bg-white/8">
                    <LogOut size={16} /> Sign out
                </button>
            </div>
        </div>
    );

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen lg:grid lg:grid-cols-[270px_1fr]">
                <aside className="hidden h-screen lg:sticky lg:top-0 lg:block">{sidebar}</aside>
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
                        <aside className="relative h-full w-[82%] max-w-[290px] shadow-2xl">{sidebar}</aside>
                        <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 rounded-full bg-white p-2 text-slate-900"><X size={20} /></button>
                    </div>
                )}
                <main className="min-w-0">
                    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-8">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-700 lg:hidden"><Menu size={22} /></button>
                            <div>
                                <div className="text-sm font-semibold text-slate-950">{title}</div>
                                <div className="hidden text-xs text-slate-500 sm:block">{user?.employee?.department?.short_name || user?.employee?.department?.name}</div>
                            </div>
                        </div>
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-800">{user?.role?.replaceAll('_', ' ')}</div>
                    </header>
                    <div className="p-4 md:p-8">{children}</div>
                </main>
            </div>
        </>
    );
}
