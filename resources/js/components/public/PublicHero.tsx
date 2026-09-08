import { Link } from '@inertiajs/react';
import { ArrowRight, FileCheck2, Landmark, LogIn, MessageCircle } from 'lucide-react';
import { talibonAssets } from '../../branding/talibonAssets';
import type { PublicContent } from './types';

export default function PublicHero({ content, authenticated }: { content: PublicContent; authenticated: boolean }) {
    const actions = [
        { title: 'Explore Services', detail: 'Find municipal service information.', href: '#services', icon: Landmark, tone: 'bg-[#0b3a71]' },
        { title: 'Transparency', detail: 'Explore public information previews.', href: '#transparency', icon: FileCheck2, tone: 'bg-[#247638]' },
        { title: authenticated ? 'Employee Portal' : 'Employee Login', detail: 'Your secure municipal workspace.', href: authenticated ? '/dashboard' : '/login', icon: LogIn, tone: 'bg-[#0759a7]' },
        { title: 'Contact Municipality', detail: 'Connect with municipal information.', href: '#contact', icon: MessageCircle, tone: 'bg-[#b84c13]' },
    ];
    return <section id="home" className="overflow-hidden rounded-xl bg-[#0b2852]">
        <div className="relative isolate flex min-h-64 items-center overflow-hidden sm:min-h-72">
            <img src={talibonAssets.publicHero} alt="" className="municipal-photo -z-20" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#eef6f4]/95 via-[#eef6f4]/75 to-transparent dark:from-[#0b2852]/95 dark:via-[#0b2852]/75" />
            <div className="max-w-3xl px-5 py-7 sm:px-8">
                <div className="text-sm font-bold uppercase tracking-wide text-[#9b3037] dark:text-rose-300">Welcome to {content.hero.title}</div>
                <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight text-[#082b56] dark:text-white sm:text-5xl 2xl:text-6xl">TALIBON, BOHOL</h1>
                <p className="mt-3 max-w-xl text-base font-medium leading-6 text-[#0b2852] dark:text-blue-100 sm:text-lg">{content.hero.lead}</p>
                <div className="mt-4 h-1 w-20 bg-[#dbb73e]" />
                <div className="mt-3 text-xs font-medium text-[#27435d] dark:text-blue-100">Municipality of Talibon · Province of Bohol</div>
            </div>
            <span className="absolute bottom-2 right-3 text-[8px] font-semibold uppercase tracking-wider text-[#123b51] dark:text-blue-100">Illustrative landscape</span>
        </div>
        <div id="quick-access" className="grid grid-cols-1 gap-2 border-t-4 border-[#e3bf45] p-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
            {actions.map(({ title, detail, href, icon: Icon, tone }) => {
                const children = <><Icon size={28} className="shrink-0" aria-hidden="true" /><div className="min-w-0 flex-1"><div className="text-xs font-bold uppercase leading-4">{title}</div><p className="mt-1 text-[10px] leading-4 text-white/90">{detail}</p></div><ArrowRight size={17} className="shrink-0" aria-hidden="true" /></>;
                const className = `flex min-h-24 items-center gap-3 rounded-lg border border-white/50 px-3 py-4 text-white transition hover:brightness-110 ${tone}`;
                return href.startsWith('#') ? <a key={href} href={href} className={className}>{children}</a> : <Link key={href} href={href} className={className}>{children}</Link>;
            })}
        </div>
    </section>;
}
