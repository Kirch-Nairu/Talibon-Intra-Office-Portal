import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    FileCheck2,
    FileText,
    Landmark,
    MapPin,
    Megaphone,
    Network,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicHeader from '../../components/public/PublicHeader';

type ServiceItem = {
    title: string;
    description: string;
    status: string;
};

type TransparencyItem = {
    label: string;
    value: string;
    note: string;
};

type ProjectItem = {
    title: string;
    summary: string;
    tag: string;
};

type DashboardItem = {
    label: string;
    value: string;
    detail: string;
};

type NewsItem = {
    type: string;
    title: string;
    summary: string;
    date: string;
};

type PublicContent = {
    dataMode: string;
    sampleLabel: string;
    municipality: string;
    hero: {
        eyebrow: string;
        title: string;
        lead: string;
        description: string;
    };
    services: ServiceItem[];
    transparency: TransparencyItem[];
    projects: ProjectItem[];
    dashboard: DashboardItem[];
    news: NewsItem[];
    contact: {
        heading: string;
        description: string;
        location: string;
    };
};

type Props = {
    appName: string;
    authenticated: boolean;
    content: PublicContent;
};

const serviceIcons = [FileCheck2, Users, FileText, Megaphone, Building2, ShieldCheck];
const sectionClass = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

function SampleBadge({ label, dark = false }: { label: string; dark?: boolean }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                dark
                    ? 'border-blue-300/30 bg-blue-300/10 text-blue-100'
                    : 'border-blue-200 bg-blue-50 text-blue-800'
            }`}
        >
            {label}
        </span>
    );
}

export default function Home({ appName, authenticated, content }: Props) {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const stored = window.localStorage.getItem('one-talibon-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDark(stored ? stored === 'dark' : prefersDark);
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
    const card = dark
        ? 'border-white/10 bg-slate-900/70 shadow-black/10'
        : 'border-slate-200 bg-white shadow-slate-900/5';

    return (
        <>
            <Head title="One Talibon">
                <meta
                    name="description"
                    content="One Talibon public prototype portal for the Municipality of Talibon, Bohol."
                />
            </Head>

            <div className={`min-h-screen transition-colors duration-200 ${page}`}>
                <PublicHeader authenticated={authenticated} dark={dark} onToggleDark={toggleDark} />

                <main>
                    <section id="home" className="relative overflow-hidden bg-[#08264d] text-white">
                        <div className="absolute inset-0 opacity-20" aria-hidden="true">
                            <div className="absolute -right-24 -top-36 h-[32rem] w-[32rem] rounded-full border border-blue-300/30" />
                            <div className="absolute -right-4 -top-20 h-80 w-80 rounded-full border border-blue-300/20" />
                            <div className="absolute bottom-0 left-1/3 h-px w-1/2 bg-gradient-to-r from-transparent via-blue-200/40 to-transparent" />
                        </div>

                        <div className={`${sectionClass} relative grid min-h-[640px] items-center gap-12 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-28`}>
                            <div className="max-w-3xl">
                                <div className="mb-6 flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-100">
                                        <Landmark size={16} /> {content.hero.eyebrow}
                                    </span>
                                    <SampleBadge label={content.sampleLabel} dark />
                                </div>
                                <h1 className="text-5xl font-black tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                                    {content.hero.title}
                                </h1>
                                <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-blue-100 sm:text-2xl">
                                    {content.hero.lead}
                                </p>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100/80 sm:text-lg">
                                    {content.hero.description}
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <a
                                        href="#services"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#08264d] transition hover:bg-blue-50"
                                    >
                                        Explore Services <ArrowRight size={17} />
                                    </a>
                                    <Link
                                        href={authenticated ? '/dashboard' : '/login'}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                                    >
                                        {authenticated ? 'Open Employee Portal' : 'Employee Portal'} <ChevronRight size={17} />
                                    </Link>
                                </div>
                                <div className="mt-8 inline-flex items-center gap-2 text-sm text-blue-200">
                                    <MapPin size={16} /> Talibon, Bohol, Philippines
                                </div>
                            </div>

                            <div className="lg:justify-self-end">
                                <div className="relative mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-5">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Municipal digital front door</div>
                                            <div className="mt-1 text-xl font-bold">Public information, one place</div>
                                        </div>
                                        <Network className="text-blue-200" size={28} />
                                    </div>
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {[
                                            ['Services', 'Find municipal service information', FileCheck2],
                                            ['Transparency', 'Preview approved public information', FileText],
                                            ['Projects', 'Present public project updates', Building2],
                                            ['Advisories', 'Surface public notices and events', Megaphone],
                                        ].map(([title, description, Icon]) => {
                                            const Visual = Icon as typeof FileCheck2;
                                            return (
                                                <div key={title as string} className="rounded-2xl border border-white/10 bg-slate-950/15 p-4">
                                                    <Visual size={20} className="text-blue-200" />
                                                    <div className="mt-3 font-bold">{title as string}</div>
                                                    <div className="mt-1 text-xs leading-5 text-blue-100/75">{description as string}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-5 rounded-2xl border border-blue-200/15 bg-blue-100/10 p-4 text-xs leading-5 text-blue-100">
                                        Public content shown on this prototype is deliberately separated from secured employee workflows and internal operational data.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="services" className={`py-20 sm:py-24 ${dark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                        <div className={sectionClass}>
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-2xl">
                                    <div className={`text-xs font-black uppercase tracking-[0.2em] ${dark ? 'text-blue-300' : 'text-blue-700'}`}>Public Services</div>
                                    <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Start with the right municipal office.</h2>
                                    <p className={`mt-4 text-base leading-7 ${muted}`}>A public-facing service directory concept designed to guide residents and stakeholders without pretending that prototype cards are live transaction engines.</p>
                                </div>
                                <SampleBadge label={content.sampleLabel} />
                            </div>

                            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {content.services.map((service, index) => {
                                    const Icon = serviceIcons[index % serviceIcons.length];
                                    return (
                                        <article key={service.title} className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${dark ? 'bg-blue-500/15 text-blue-200' : 'bg-blue-50 text-blue-900'}`}>
                                                <Icon size={21} />
                                            </div>
                                            <h3 className="mt-5 text-lg font-bold">{service.title}</h3>
                                            <p className={`mt-2 text-sm leading-6 ${muted}`}>{service.description}</p>
                                            <div className={`mt-5 border-t pt-4 text-xs font-semibold ${dark ? 'border-white/10 text-blue-300' : 'border-slate-100 text-blue-800'}`}>{service.status}</div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section id="transparency" className="py-20 sm:py-24">
                        <div className={`${sectionClass} grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start`}>
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                                    <ShieldCheck size={16} /> Transparency
                                </div>
                                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Designed for approved public information.</h2>
                                <p className={`mt-4 text-base leading-7 ${muted}`}>This section demonstrates how public documents, reports, and notices can be organized after publication rules and authoritative datasets are approved.</p>
                                <div className={`mt-6 rounded-2xl border p-5 ${dark ? 'border-amber-300/20 bg-amber-300/5 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
                                    <div className="text-xs font-black uppercase tracking-[0.18em]">Prototype disclosure</div>
                                    <p className="mt-2 text-sm leading-6">The values on this page are sample presentation content. They are not official municipal statistics and do not query the secured Core Portal Reports module.</p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {content.transparency.map((item) => (
                                    <article key={item.label} className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                                        <FileText size={20} className={dark ? 'text-blue-300' : 'text-blue-800'} />
                                        <div className={`mt-5 text-xs font-bold uppercase tracking-[0.12em] ${muted}`}>{item.label}</div>
                                        <div className="mt-2 text-xl font-black">{item.value}</div>
                                        <p className={`mt-3 text-xs leading-5 ${muted}`}>{item.note}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="projects" className={`py-20 sm:py-24 ${dark ? 'bg-slate-900/50' : 'bg-[#f4f7fb]'}`}>
                        <div className={sectionClass}>
                            <div className="max-w-2xl">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Projects & Accomplishments</div>
                                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A clearer public view of municipal progress.</h2>
                                <p className={`mt-4 text-base leading-7 ${muted}`}>Prototype cards for future client-approved project and accomplishment publishing.</p>
                            </div>
                            <div className="mt-10 grid gap-5 lg:grid-cols-3">
                                {content.projects.map((project, index) => (
                                    <article key={project.title} className={`overflow-hidden rounded-3xl border shadow-sm ${card}`}>
                                        <div className={`flex h-36 items-end p-6 ${dark ? 'bg-blue-950/70' : index === 1 ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${dark ? 'bg-white/10 text-blue-100' : 'bg-white text-blue-900 shadow-sm'}`}>{project.tag}</span>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold">{project.title}</h3>
                                            <p className={`mt-3 text-sm leading-6 ${muted}`}>{project.summary}</p>
                                            <div className={`mt-5 inline-flex items-center gap-2 text-xs font-bold ${dark ? 'text-blue-300' : 'text-blue-800'}`}>
                                                <Sparkles size={15} /> {content.sampleLabel}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="dashboards" className="py-20 sm:py-24">
                        <div className={sectionClass}>
                            <div className={`overflow-hidden rounded-[2rem] border ${dark ? 'border-white/10 bg-[#071b36]' : 'border-slate-200 bg-[#0b2852]'} text-white`}>
                                <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                                            <BarChart3 size={17} /> Public Dashboard Preview
                                        </div>
                                        <h2 className="mt-4 text-3xl font-black tracking-tight">Public-safe information at a glance.</h2>
                                        <p className="mt-4 text-sm leading-7 text-blue-100/80">This is a design preview only. It is intentionally disconnected from employee workload, correspondence, Reports, audit, and other protected operational counters.</p>
                                        <div className="mt-6"><SampleBadge label={content.sampleLabel} dark /></div>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {content.dashboard.map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                                <div className="text-xs font-bold uppercase tracking-[0.12em] text-blue-200">{item.label}</div>
                                                <div className="mt-3 text-2xl font-black">{item.value}</div>
                                                <div className="mt-2 text-xs leading-5 text-blue-100/70">{item.detail}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="news" className={`py-20 sm:py-24 ${dark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <div className={sectionClass}>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                                        <CalendarDays size={16} /> News, Events & Advisories
                                    </div>
                                    <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A single surface for public updates.</h2>
                                </div>
                                <SampleBadge label={content.sampleLabel} />
                            </div>
                            <div className="mt-10 grid gap-4 lg:grid-cols-3">
                                {content.news.map((item) => (
                                    <article key={`${item.type}-${item.title}`} className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${dark ? 'bg-blue-500/15 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>{item.type}</span>
                                            <span className={`text-xs ${muted}`}>{item.date}</span>
                                        </div>
                                        <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                                        <p className={`mt-3 text-sm leading-6 ${muted}`}>{item.summary}</p>
                                    </article>
                                ))}
                            </div>
                            <p className={`mt-5 text-xs leading-5 ${muted}`}>Calendar integration is not active on this public prototype. Items above are config-backed sample presentation content.</p>
                        </div>
                    </section>

                    <section id="about" className="py-20 sm:py-24">
                        <div className={`${sectionClass} grid gap-8 lg:grid-cols-2`}>
                            <div className={`rounded-3xl border p-7 sm:p-9 ${card}`}>
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-900"><Landmark size={23} /></div>
                                <h2 className="mt-6 text-3xl font-black tracking-tight">About One Talibon</h2>
                                <p className={`mt-4 text-base leading-7 ${muted}`}>One Talibon is presented here as a unified municipal digital front door: public information on the outside, secured employee operations behind the existing Core Portal security boundary.</p>
                                <div className="mt-6 space-y-3">
                                    {['Public and internal experiences remain deliberately separated.', 'Prototype content is labelled when it is not an approved municipal fact.', 'Employee access continues through the secured Laravel authentication flow.'].map((line) => (
                                        <div key={line} className={`flex items-start gap-3 text-sm leading-6 ${muted}`}><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /> {line}</div>
                                    ))}
                                </div>
                            </div>

                            <div id="contact" className="rounded-3xl bg-[#0b2852] p-7 text-white sm:p-9">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">Contact & Municipal Information</div>
                                <h2 className="mt-4 text-3xl font-black">{content.contact.heading}</h2>
                                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/80">{content.contact.description}</p>
                                <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <MapPin size={20} className="mt-0.5 shrink-0 text-blue-200" />
                                    <div>
                                        <div className="font-bold">Municipal location</div>
                                        <div className="mt-1 text-sm text-blue-100/80">{content.contact.location}</div>
                                    </div>
                                </div>
                                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-blue-100/80">Official contact directories and publishing workflows can be connected only after client-approved information is supplied and validated.</div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className={`border-t py-8 ${dark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                    <div className={`${sectionClass} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
                        <div>
                            <div className="text-sm font-black tracking-tight">ONE TALIBON</div>
                            <div className={`mt-1 text-xs ${muted}`}>{content.municipality} · Public prototype presentation</div>
                        </div>
                        <div className={`text-xs ${muted}`}>{appName} · {content.sampleLabel}</div>
                    </div>
                </footer>
            </div>
        </>
    );
}
