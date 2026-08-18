import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, BriefcaseBusiness, Building2, FileBarChart, FileText, Gavel, LayoutDashboard, LogOut, Menu, ShieldCheck, Users, X } from 'lucide-react';
import { PropsWithChildren, useEffect, useState } from 'react';
import type { SharedProps } from '../types';

type Props = PropsWithChildren<{ title: string }>;

export default function AppLayout({ title, children }: Props) {
    const { auth, pendingMemo, unreadMemoCount, notifications, notificationCount, flash } = usePage<SharedProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [dismissedMemoId, setDismissedMemoId] = useState<number | null>(null);
    const user = auth.user;
    const isMayor = ['system_admin', 'mayor_approver', 'mayor_staff'].includes(user?.role ?? '');
    const isHr = ['system_admin', 'hr_officer'].includes(user?.role ?? '');
    const canAudit = ['system_admin', 'mayor_approver'].includes(user?.role ?? '');
    const canReports = isMayor || isHr;

    useEffect(() => {
        const timer = window.setInterval(() => router.reload({
            only: ['pendingMemo', 'unreadMemoCount', 'notifications', 'notificationCount'],
            preserveState: true,
            preserveScroll: true,
        }), 5000);
        return () => window.clearInterval(timer);
    }, []);

    const nav = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
        { label: 'My Work', href: '/transactions', icon: FileText, show: true },
        { label: "Mayor's Office", href: '/mayor-office', icon: Building2, show: isMayor },
        { label: 'Operations', href: '/operations', icon: BriefcaseBusiness, show: isMayor },
        { label: 'Memoranda', href: '/memoranda', icon: FileText, show: true },
        { label: 'Central Records', href: '/legislation', icon: Gavel, show: true },
        { label: 'HRIS', href: '/hris', icon: Users, show: true },
        { label: 'Employees', href: '/employees', icon: Users, show: true },
        { label: 'Departments', href: '/departments', icon: Building2, show: true },
        { label: 'Reports', href: '/reports', icon: FileBarChart, show: canReports },
        { label: 'Audit & Security', href: '/audit', icon: ShieldCheck, show: canAudit },
    ].filter((item) => item.show);

    const sidebar = (
        <div className="flex h-full flex-col bg-[#0b2852] text-white">
            <div className="border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-200 sm:text-xs">Municipality of Talibon</div>
                <div className="mt-1.5 text-lg font-bold sm:mt-2 sm:text-xl">Intra-Office Portal</div>
                <div className="mt-1 text-[10px] text-blue-200 sm:text-xs">Prototype Environment</div>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3 sm:space-y-1 sm:px-3 sm:py-5">
                {nav.map(({ label, href, icon: Icon }) => (
                    <Link key={label} href={href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-blue-100 transition hover:bg-white/10 hover:text-white sm:py-2.5 sm:text-sm">
                        <Icon size={17} />
                        <span>{label}</span>
                        {label === 'Memoranda' && unreadMemoCount > 0 && <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-slate-950 sm:text-[10px]">{unreadMemoCount}</span>}
                    </Link>
                ))}
            </nav>
            <div className="border-t border-white/10 p-3 sm:p-4">
                <div className="rounded-xl bg-white/10 p-2.5 sm:p-3">
                    <div className="truncate text-[13px] font-semibold sm:text-sm">{user?.name}</div>
                    <div className="mt-1 truncate text-[10px] text-blue-200 sm:text-xs">{user?.employee?.department?.name}</div>
                    <div className="truncate text-[10px] text-blue-300 sm:text-xs">{user?.employee?.position}</div>
                </div>
                <button onClick={() => router.post('/logout')} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-blue-100 hover:bg-white/10 sm:mt-3 sm:text-sm"><LogOut size={15} /> Sign out</button>
            </div>
        </div>
    );

    const showMemo = pendingMemo && dismissedMemoId !== pendingMemo.id;

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen lg:grid lg:grid-cols-[270px_1fr]">
                <aside className="hidden h-screen lg:sticky lg:top-0 lg:block">{sidebar}</aside>

                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
                        <aside className="relative h-full w-[78%] max-w-[270px] shadow-2xl">{sidebar}</aside>
                        <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 rounded-full bg-white p-1.5 text-slate-900 shadow"><X size={18} /></button>
                    </div>
                )}

                <main className="min-w-0">
                    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur sm:h-16 sm:px-4 md:px-8">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <button onClick={() => setMobileOpen(true)} className="shrink-0 rounded-lg p-1.5 text-slate-700 lg:hidden"><Menu size={20} /></button>
                            <div className="min-w-0">
                                <div className="truncate text-[13px] font-semibold text-slate-950 sm:text-sm">{title}</div>
                                <div className="hidden text-xs text-slate-500 sm:block">{user?.employee?.department?.short_name || user?.employee?.department?.name}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative">
                                <button onClick={() => setNotificationsOpen((open) => !open)} className="relative rounded-full p-1.5 text-slate-600 hover:bg-slate-100 sm:p-2" aria-label="Open notifications">
                                    <Bell size={18} />
                                    {notificationCount > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[9px] font-bold text-white sm:text-[10px]">{notificationCount > 9 ? '9+' : notificationCount}</span>}
                                </button>

                                {notificationsOpen && (
                                    <div className="absolute right-0 top-10 z-50 w-[min(350px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                            <div><div className="text-[12px] font-bold text-slate-950 sm:text-sm">Live activity</div><div className="text-[9px] text-slate-500 sm:text-xs">Updates automatically every few seconds</div></div>
                                            <button onClick={() => setNotificationsOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X size={16} /></button>
                                        </div>
                                        <div className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
                                            {notifications.map((notification) => (
                                                <Link key={notification.key} href={notification.url} onClick={() => setNotificationsOpen(false)} className="block px-4 py-3 transition hover:bg-slate-50">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="text-[10px] font-bold uppercase tracking-wide text-blue-700 sm:text-xs">{notification.title}</div>
                                                            <div className="mt-1 text-[11px] leading-4 text-slate-700 sm:text-sm">{notification.message}</div>
                                                            {notification.created_at && <div className="mt-1.5 text-[9px] text-slate-400 sm:text-[10px]">{new Date(notification.created_at).toLocaleString()}</div>}
                                                        </div>
                                                        {notification.urgent && <span className="shrink-0 rounded-full bg-rose-50 px-2 py-1 text-[8px] font-bold uppercase text-rose-700 sm:text-[9px]">Action</span>}
                                                    </div>
                                                </Link>
                                            ))}
                                            {notifications.length === 0 && <div className="px-4 py-8 text-center text-[11px] text-slate-500 sm:text-sm">No current notifications.</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="hidden rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-800 sm:block">{user?.role?.replaceAll('_', ' ')}</div>
                        </div>
                    </header>

                    {(flash?.success || flash?.error) && <div className={`mx-3 mt-3 rounded-xl border px-3 py-2.5 text-[12px] font-semibold sm:mx-4 sm:mt-4 sm:px-4 sm:py-3 sm:text-sm md:mx-8 ${flash.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{flash.success || flash.error}</div>}
                    <div className="p-3 sm:p-4 md:p-8">{children}</div>
                </main>
            </div>

            {showMemo && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8">
                        <div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800 sm:h-12 sm:w-12 sm:rounded-2xl"><Bell size={19} /></div><button onClick={() => setDismissedMemoId(pendingMemo.id)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 sm:p-2"><X size={18} /></button></div>
                        <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:mt-6 sm:text-xs">New Memorandum · {pendingMemo.memo_number}</div>
                        <h2 className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">{pendingMemo.title}</h2>
                        <p className="mt-2 text-[12px] text-slate-500 sm:mt-3 sm:text-sm">Issued by {pendingMemo.department || pendingMemo.issuer || "Mayor's Office"}. {pendingMemo.requires_acknowledgement ? 'Acknowledgement is required.' : 'Please review this issuance.'}</p>
                        <div className="mt-5 flex justify-end gap-2 sm:mt-7 sm:gap-3"><button onClick={() => setDismissedMemoId(pendingMemo.id)} className="rounded-xl border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-700 sm:px-4 sm:py-2.5 sm:text-sm">Later</button><Link href={`/memoranda/${pendingMemo.id}`} className="rounded-xl bg-[#0b2852] px-4 py-2 text-[12px] font-semibold text-white sm:px-5 sm:py-2.5 sm:text-sm">Open memorandum</Link></div>
                    </div>
                </div>
            )}
        </>
    );
}
