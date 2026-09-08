import { Link } from '@inertiajs/react';
import { Home, LogIn, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppearanceControl from '../AppearanceControl';
import MunicipalBrand from '../MunicipalBrand';

type Props = { authenticated: boolean };
export const publicLinks = [
    ['Home', '#home'], ['Services', '#services'], ['Transparency', '#transparency'],
    ['Projects', '#projects'], ['At a Glance', '#dashboards'],
    ['News & Events', '#news'], ['About Talibon', '#about'], ['Contact', '#contact'],
] as const;

export default function PublicHeader({ authenticated }: Props) {
    const [open, setOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (!open) return;
        const escape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
        };
        window.addEventListener('keydown', escape);
        return () => window.removeEventListener('keydown', escape);
    }, [open]);
    return <header className="public-header sticky top-0 z-50 border-b border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-[#111d2d] dark:text-slate-100">
        <div className="public-masthead">
            <a href="#home" aria-label="One Talibon home" className="public-brand"><MunicipalBrand publicPortal /><span className="public-brand-caption">Municipality of Talibon, Bohol</span></a>
            <button ref={trigger} type="button" onClick={() => setOpen(!open)} className="order-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="public-navigation">{open ? <X size={21} /> : <Menu size={21} />}</button>
            <div className="ml-auto flex items-center gap-3">
                <div className="hidden lg:block"><AppearanceControl publicSurface /></div>
                <Link href={authenticated ? '/dashboard' : '/login'} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0b2852] px-3 text-sm font-semibold text-white hover:bg-blue-900 dark:bg-blue-700"><LogIn size={16} aria-hidden="true" /><span className="hidden sm:inline">{authenticated ? 'Employee Portal' : 'Employee Login'}</span><span className="sm:hidden">{authenticated ? 'Portal' : 'Login'}</span></Link>
            </div>
        </div>
        <nav id="public-navigation" aria-label="Public navigation" className={`${open ? 'block' : 'hidden'} max-h-[70dvh] overflow-y-auto border-t border-slate-100 dark:border-slate-700 lg:block`}>
            <div className="mx-auto flex max-w-[1600px] flex-col gap-1 px-4 py-1.5 lg:flex-row lg:items-center lg:justify-center lg:gap-2 sm:px-6">
                {publicLinks.map(([label, href], index) => <a key={href} href={href} onClick={() => setOpen(false)} className={`inline-flex min-h-11 items-center gap-2 rounded-md px-3 whitespace-nowrap text-[13px] font-medium transition-colors duration-150 ${index === 0 ? 'bg-[#0b2852] text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{index === 0 && <Home size={15} aria-hidden="true" />}{label}</a>)}
            </div>
            <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700 lg:hidden"><AppearanceControl publicSurface /></div>
        </nav>
    </header>;
}
