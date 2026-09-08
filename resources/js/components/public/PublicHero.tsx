import { Link } from '@inertiajs/react';
import { ArrowRight, FileCheck2, Landmark, LogIn, MessageCircle } from 'lucide-react';
import { talibonAssets } from '../../branding/talibonAssets';
import type { PublicContent } from './types';

export default function PublicHero({ authenticated }: { content: PublicContent; authenticated: boolean }) {
    const actions = [
        { title: 'Explore Services', href: '#services', icon: Landmark, tone: 'bg-[#0b2852]' },
        { title: 'Transparency', href: '#transparency', icon: FileCheck2, tone: 'bg-[#0b2852]' },
        { title: authenticated ? 'Employee Portal' : 'Employee Login', href: authenticated ? '/dashboard' : '/login', icon: LogIn, tone: 'bg-[#1769aa]' },
        { title: 'Contact Municipality', href: '#contact', icon: MessageCircle, tone: 'bg-[#0b2852]' },
    ];
    return <section id="home" className="overflow-hidden rounded-xl bg-[#0b2852]">
        <div className="relative isolate flex min-h-52 items-center overflow-hidden sm:min-h-64">
            <img src={talibonAssets.publicHero} alt="" className="municipal-photo -z-20" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#eef6f4]/95 via-[#eef6f4]/75 to-transparent dark:from-[#0b2852]/95 dark:via-[#0b2852]/75" />
            <div className="max-w-3xl px-5 py-7 sm:px-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#0b2852] dark:text-blue-100">Welcome to One Talibon</div>
                <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-[#082b56] dark:text-white sm:text-5xl 2xl:text-5xl">TALIBON, BOHOL</h1>
                <p className="mt-3 max-w-xl text-base font-medium leading-6 text-[#0b2852] dark:text-blue-100 sm:text-lg">Connected services. Clear information. Better coordination.</p>
                <div className="mt-4 h-1 w-20 bg-[#dbb73e]" />
                <div className="mt-3 text-xs font-medium text-[#27435d] dark:text-blue-100">Municipality of Talibon · Province of Bohol</div>
            </div>
        </div>
        <div id="quick-access" className="grid grid-cols-2 gap-px border-t-2 border-[#e5b63a] bg-white/20 xl:grid-cols-4">
            {actions.map(({ title, href, icon: Icon, tone }) => {
                const children = <><Icon size={22} className="shrink-0" aria-hidden="true" /><div className="min-w-0 flex-1"><div className="text-sm font-semibold leading-5">{title}</div></div><ArrowRight size={17} className="hidden shrink-0 sm:block" aria-hidden="true" /></>;
                const className = `flex min-h-20 items-center gap-3 px-4 py-4 text-white transition-colors duration-150 hover:bg-[#1769aa] ${tone}`;
                return href.startsWith('#') ? <a key={href} href={href} className={className}>{children}</a> : <Link key={href} href={href} className={className}>{children}</Link>;
            })}
        </div>
    </section>;
}
