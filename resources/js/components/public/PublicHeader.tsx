import { Link } from '@inertiajs/react';
import { Building2, Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
    authenticated: boolean;
    dark: boolean;
    onToggleDark: () => void;
};

const links = [
    ['Home', '#home'],
    ['Services', '#services'],
    ['Transparency', '#transparency'],
    ['Projects', '#projects'],
    ['Dashboards', '#dashboards'],
    ['News & Events', '#news'],
    ['About', '#about'],
    ['Contact', '#contact'],
] as const;

export default function PublicHeader({ authenticated, dark, onToggleDark }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <header className={`sticky top-0 z-50 border-b backdrop-blur ${dark ? 'border-white/10 bg-slate-950/90' : 'border-slate-200/80 bg-white/90'}`}>
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <a href="#home" className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${dark ? 'bg-blue-500/15 text-blue-200' : 'bg-blue-50 text-blue-900'}`}><Building2 size={21} /></span>
                    <span className="min-w-0">
                        <span className={`block text-[10px] font-bold uppercase tracking-[0.18em] ${dark ? 'text-blue-300' : 'text-blue-700'}`}>Municipality of Talibon</span>
                        <span className={`block truncate text-lg font-black tracking-tight ${dark ? 'text-white' : 'text-slate-950'}`}>ONE TALIBON</span>
                    </span>
                </a>

                <nav className="hidden items-center gap-5 xl:flex">
                    {links.map(([label, href]) => <a key={href} href={href} className={`text-sm font-medium transition ${dark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-900'}`}>{label}</a>)}
                </nav>

                <div className="flex items-center gap-2">
                    <button onClick={onToggleDark} className={`rounded-xl p-2.5 transition ${dark ? 'bg-white/10 text-slate-200 hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} aria-label="Toggle dark mode">
                        {dark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <Link href={authenticated ? '/dashboard' : '/login'} className="hidden rounded-xl bg-[#0b2852] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10396f] sm:inline-flex">
                        {authenticated ? 'Open Employee Portal' : 'Employee Login'}
                    </Link>
                    <button onClick={() => setOpen(!open)} className={`rounded-xl p-2.5 xl:hidden ${dark ? 'text-white' : 'text-slate-700'}`} aria-label="Open menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
                </div>
            </div>

            {open && (
                <div className={`border-t px-4 py-4 xl:hidden ${dark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                    <div className="mx-auto grid max-w-7xl gap-1">
                        {links.map(([label, href]) => <a key={href} onClick={() => setOpen(false)} href={href} className={`rounded-lg px-3 py-2 text-sm font-medium ${dark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}>{label}</a>)}
                        <Link href={authenticated ? '/dashboard' : '/login'} className="mt-2 rounded-xl bg-[#0b2852] px-4 py-3 text-center text-sm font-semibold text-white">{authenticated ? 'Open Employee Portal' : 'Employee Login'}</Link>
                    </div>
                </div>
            )}
        </header>
    );
}
