import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Building2,
    CalendarDays,
    FileCheck2,
    FileText,
    Landmark,
    MapPin,
    Megaphone,
    Network,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicHeader from '../../components/public/PublicHeader';

type ServiceItem = { title: string; description: string; status: string };
type TransparencyItem = { label: string; value: string; note: string };
type ProjectItem = { title: string; summary: string; tag: string };
type DashboardItem = { label: string; value: string; detail: string };
type NewsItem = { type: string; title: string; summary: string; date: string };
type PublicContent = {
    dataMode: string;
    sampleLabel: string;
    municipality: string;
    hero: { eyebrow: string; title: string; lead: string; description: string };
    services: ServiceItem[];
    transparency: TransparencyItem[];
    projects: ProjectItem[];
    dashboard: DashboardItem[];
    news: NewsItem[];
    contact: { heading: string; description: string; location: string };
};
type Props = { appName: string; authenticated: boolean; content: PublicContent };

const sectionClass = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';
const serviceIcons = [FileCheck2, Users, FileText, Megaphone, Building2, ShieldCheck];
const quickAccess = [
    ['Services', '#services', FileCheck2],
    ['Transparency', '#transparency', ShieldCheck],
    ['Projects', '#projects', Building2],
    ['Dashboards', '#dashboards', BarChart3],
    ['News & Events', '#news', CalendarDays],
    ['Contact', '#contact', MapPin],
] as const;

function PrototypeBadge({ label, dark = false }: { label: string; dark?: boolean }) {
    return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${dark ? 'border-blue-200/25 bg-blue-100/10 text-blue-100' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>{label}</span>;
}

export default function Home({ appName, authenticated, content }: Props) {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const stored = window.localStorage.getItem('one-talibon-theme');
        setDark(stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, []);

    function toggleDark() {
        setDark((current) => {
            const next = !current;
            window.localStorage.setItem('one-talibon-theme', next ? 'dark' : 'light');
            return next;
        });
    }

    const page = dark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-950';
    const muted = dark ? 'text-slate-300' : 'text-slate-600';
    const card = dark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white';
    const announcements = content.news.slice(0, 2);

    return <>
        <Head title="One Talibon"><meta name="description" content="One Talibon public prototype portal for the Municipality of Talibon, Bohol." /></Head>
        <div className={`min-h-screen transition-colors ${page}`}>
            <PublicHeader authenticated={authenticated} dark={dark} onToggleDark={toggleDark} />
            <main>
                <section id="home" className="relative overflow-hidden bg-[#08264d] text-white">
                    <div className="absolute inset-0 opacity-20" aria-hidden="true"><div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full border border-blue-200/30" /><div className="absolute -right-10 top-10 h-72 w-72 rounded-full border border-blue-200/20" /></div>
                    <div className={`${sectionClass} relative grid min-h-[600px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24`}>
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-100"><Landmark size={16} /> {content.hero.eyebrow}</span><PrototypeBadge label={content.sampleLabel} dark /></div>
                            <h1 className="mt-7 text-5xl font-black tracking-[-0.04em] sm:text-6xl lg:text-7xl">{content.hero.title}</h1>
                            <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-blue-100 sm:text-2xl">{content.hero.lead}</p>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100/80 sm:text-lg">{content.hero.description}</p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#quick-access" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#08264d] hover:bg-blue-50">Explore One Talibon <ArrowRight size={17} /></a><Link href={authenticated ? '/dashboard' : '/login'} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold hover:bg-white/10">{authenticated ? 'Open Employee Portal' : 'Employee Portal'} <ArrowRight size={17} /></Link></div>
                            <div className="mt-7 inline-flex items-center gap-2 text-sm text-blue-200"><MapPin size={16} /> Talibon, Bohol, Philippines</div>
                        </div>
                        <aside className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
                            <div className="flex items-start justify-between gap-5"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Municipal digital front door</div><h2 className="mt-2 text-2xl font-bold">Public information in one clear place.</h2></div><Network size={30} className="shrink-0 text-blue-200" /></div>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">{[['Public services', 'Find the appropriate municipal office.'], ['Transparency', 'Organize approved public information.'], ['Projects', 'Preview public-facing program updates.'], ['Advisories', 'Read prototype notices and events.']].map(([title, description]) => <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/15 p-4"><div className="font-bold">{title}</div><div className="mt-1 text-xs leading-5 text-blue-100/75">{description}</div></div>)}</div>
                            <p className="mt-5 rounded-2xl border border-blue-200/15 bg-blue-100/10 p-4 text-xs leading-5 text-blue-100">This public prototype is deliberately separated from employee identity, internal workflow, correspondence, Reports, notifications, and protected operational counters.</p>
                        </aside>
                    </div>
                </section>

                <section id="quick-access" className={`border-b py-10 ${dark ? 'border-white/10 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
                    <div className={sectionClass}><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Quick Access</div><h2 className="mt-1 text-xl font-black">Go directly to public information.</h2></div><PrototypeBadge label={content.sampleLabel} /></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{quickAccess.map(([label, href, Icon]) => <a key={label} href={href} className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-bold transition hover:border-blue-300 ${card}`}><Icon size={18} className="text-blue-700" /> {label}</a>)}</div></div>
                </section>

                <section className={`py-16 sm:py-20 ${dark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                    <div className={`${sectionClass} grid gap-8 lg:grid-cols-[0.9fr_1.1fr]`}>
                        <div><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Municipal Information</div><h2 className="mt-2 text-3xl font-black tracking-tight">A public-facing information layer for {content.municipality}.</h2><p className={`mt-4 max-w-xl text-base leading-7 ${muted}`}>One Talibon is presented here as a prototype public information experience: a clear entry point for service guidance, approved transparency content, municipal programs, advisories, and contact information.</p></div>
                        <div className="grid gap-3 sm:grid-cols-3">{[[Landmark, 'Municipality', content.municipality], [MapPin, 'Location', content.contact.location], [ShieldCheck, 'Content mode', content.dataMode === 'prototype' ? 'Prototype presentation' : content.dataMode]].map(([Icon, label, value]) => { const Visual = Icon as typeof Landmark; return <div key={label as string} className={`rounded-2xl border p-5 ${card}`}><Visual size={20} className="text-blue-700" /><div className={`mt-4 text-xs font-bold uppercase tracking-wide ${muted}`}>{label as string}</div><div className="mt-1 text-sm font-bold">{value as string}</div></div>; })}</div>
                    </div>
                </section>

                <section className="py-16 sm:py-20">
                    <div className={sectionClass}><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700"><Megaphone size={16} /> Public Announcements</div><h2 className="mt-2 text-3xl font-black tracking-tight">Notices presented from public prototype content.</h2></div><PrototypeBadge label={content.sampleLabel} /></div><div className="mt-8 grid gap-4 lg:grid-cols-2">{announcements.map((item) => <article key={`${item.type}-${item.title}`} className={`rounded-2xl border p-6 ${card}`}><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-wide text-blue-700">{item.type}</span><span className={`text-xs ${muted}`}>{item.date}</span></div><h3 className="mt-3 text-xl font-bold">{item.title}</h3><p className={`mt-2 text-sm leading-6 ${muted}`}>{item.summary}</p></article>)}</div></div>
                </section>

                <section id="services" className={`py-16 sm:py-20 ${dark ? 'bg-slate-900/50' : 'bg-[#f4f7fb]'}`}>
                    <div className={sectionClass}><div className="max-w-2xl"><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Services</div><h2 className="mt-2 text-3xl font-black tracking-tight">Start with the right municipal office.</h2><p className={`mt-4 text-base leading-7 ${muted}`}>These cards are public service guidance concepts, not live citizen transaction or permit-processing systems.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{content.services.map((service, index) => { const Icon = serviceIcons[index % serviceIcons.length]; return <article key={service.title} className={`rounded-2xl border p-6 ${card}`}><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-900"><Icon size={21} /></div><h3 className="mt-4 text-lg font-bold">{service.title}</h3><p className={`mt-2 text-sm leading-6 ${muted}`}>{service.description}</p><div className="mt-4 border-t border-slate-200/60 pt-4 text-xs font-semibold text-blue-700">{service.status}</div></article>; })}</div></div>
                </section>

                <section id="projects" className="py-16 sm:py-20">
                    <div className={sectionClass}><div className="max-w-2xl"><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Projects & Programs Preview</div><h2 className="mt-2 text-3xl font-black tracking-tight">Prototype-safe public program presentation.</h2><p className={`mt-4 text-base leading-7 ${muted}`}>These previews demonstrate future public publishing and are not a claim that a full Project Monitoring system is operational.</p></div><div className="mt-8 grid gap-4 lg:grid-cols-3">{content.projects.map((project) => <article key={project.title} className={`rounded-2xl border p-6 ${card}`}><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{project.tag}</span><h3 className="mt-4 text-xl font-bold">{project.title}</h3><p className={`mt-2 text-sm leading-6 ${muted}`}>{project.summary}</p><div className="mt-4"><PrototypeBadge label={content.sampleLabel} /></div></article>)}</div></div>
                </section>

                <section id="transparency" className={`py-16 sm:py-20 ${dark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <div className={`${sectionClass} grid gap-8 lg:grid-cols-[0.8fr_1.2fr]`}><div><div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700"><ShieldCheck size={16} /> Transparency Preview</div><h2 className="mt-2 text-3xl font-black tracking-tight">Only approved public information belongs here.</h2><p className={`mt-4 text-base leading-7 ${muted}`}>The values below are sample presentation content. They are not official municipal statistics and do not query secured Core Portal Reports, correspondence, workflow, or audit data.</p></div><div className="grid gap-3 sm:grid-cols-3">{content.transparency.map((item) => <article key={item.label} className={`rounded-2xl border p-5 ${card}`}><FileText size={20} className="text-blue-700" /><div className={`mt-4 text-xs font-bold uppercase tracking-wide ${muted}`}>{item.label}</div><div className="mt-1 text-xl font-black">{item.value}</div><p className={`mt-2 text-xs leading-5 ${muted}`}>{item.note}</p></article>)}</div></div>
                </section>

                <section id="dashboards" className="py-16 sm:py-20">
                    <div className={sectionClass}><div className="overflow-hidden rounded-[2rem] bg-[#0b2852] p-6 text-white sm:p-8 lg:p-10"><div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]"><div><div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-200"><BarChart3 size={16} /> Public Dashboard Preview</div><h2 className="mt-3 text-3xl font-black">A public-safe information preview.</h2><p className="mt-4 text-sm leading-7 text-blue-100/80">Sample-only values are intentionally disconnected from protected employee, office, workflow, Reports, correspondence, audit, and System Administration data.</p><div className="mt-5"><PrototypeBadge label={content.sampleLabel} dark /></div></div><div className="grid gap-3 sm:grid-cols-2">{content.dashboard.map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="text-xs font-bold uppercase tracking-wide text-blue-200">{item.label}</div><div className="mt-2 text-2xl font-black">{item.value}</div><div className="mt-2 text-xs leading-5 text-blue-100/70">{item.detail}</div></div>)}</div></div></div></div>
                </section>

                <section id="news" className={`py-16 sm:py-20 ${dark ? 'bg-slate-900/50' : 'bg-[#f4f7fb]'}`}>
                    <div className={sectionClass}><div><div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700"><CalendarDays size={16} /> News & Events</div><h2 className="mt-2 text-3xl font-black tracking-tight">Public notices, events, and advisories.</h2><p className={`mt-4 max-w-2xl text-base leading-7 ${muted}`}>Config-backed prototype entries only; publication workflow and live municipal feeds are not implied.</p></div><div className="mt-8 grid gap-4 lg:grid-cols-3">{content.news.map((item) => <article key={`${item.date}-${item.title}`} className={`rounded-2xl border p-6 ${card}`}><div className="flex items-center justify-between gap-3 text-xs"><span className="font-black uppercase tracking-wide text-blue-700">{item.type}</span><span className={muted}>{item.date}</span></div><h3 className="mt-3 text-lg font-bold">{item.title}</h3><p className={`mt-2 text-sm leading-6 ${muted}`}>{item.summary}</p></article>)}</div></div>
                </section>

                <section id="about" className="py-16 sm:py-20">
                    <div className={`${sectionClass} grid gap-8 lg:grid-cols-2 lg:items-center`}><div><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">About Talibon</div><h2 className="mt-2 text-3xl font-black tracking-tight">A municipal portal experience built around clear public and employee boundaries.</h2><p className={`mt-4 text-base leading-7 ${muted}`}>The public side focuses on municipal information and prototype publishing. Authenticated employees enter a separate secured portal for authorized workflows and operational responsibilities.</p></div><div className={`rounded-3xl border p-6 ${card}`}><Landmark size={26} className="text-blue-700" /><div className="mt-4 text-xl font-bold">{content.municipality}</div><p className={`mt-2 text-sm leading-6 ${muted}`}>One Talibon public prototype · {content.contact.location}</p><div className="mt-5"><PrototypeBadge label={content.sampleLabel} /></div></div></div>
                </section>

                <section className="bg-[#08264d] py-14 text-white sm:py-16">
                    <div className={`${sectionClass} flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between`}><div className="max-w-2xl"><div className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Employee Portal</div><h2 className="mt-2 text-3xl font-black">Municipal employees continue in the secured workspace.</h2><p className="mt-3 text-sm leading-6 text-blue-100/80">Authentication, MFA, role/office scope, correspondence, and workflow authorization remain separate from this public page.</p></div><Link href={authenticated ? '/dashboard' : '/login'} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#08264d]">{authenticated ? 'Open Employee Portal' : 'Employee Login'} <ArrowRight size={17} /></Link></div>
                </section>
            </main>

            <footer id="contact" className={`border-t py-12 ${dark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                <div className={`${sectionClass} grid gap-8 md:grid-cols-[1.1fr_0.9fr]`}><div><div className="flex items-center gap-2 text-lg font-black"><Landmark size={20} className="text-blue-700" /> One Talibon</div><p className={`mt-3 max-w-xl text-sm leading-6 ${muted}`}>{content.contact.description}</p><div className="mt-4"><PrototypeBadge label={content.sampleLabel} /></div></div><div className="md:text-right"><div className="text-sm font-bold">{content.contact.heading}</div><div className={`mt-2 inline-flex items-center gap-2 text-sm ${muted}`}><MapPin size={15} /> {content.contact.location}</div><div className={`mt-5 text-xs ${muted}`}>{appName} · Public prototype presentation</div></div></div>
            </footer>
        </div>
    </>;
}
