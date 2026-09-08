import { Head } from '@inertiajs/react';
import { Info, Landmark } from 'lucide-react';
import PublicFooter from '../../components/public/PublicFooter';
import PublicGlance from '../../components/public/PublicGlance';
import PublicHeader from '../../components/public/PublicHeader';
import PublicHero from '../../components/public/PublicHero';
import PublicNewsRail from '../../components/public/PublicNewsRail';
import PublicServices from '../../components/public/PublicServices';
import PublicUpdates from '../../components/public/PublicUpdates';
import type { PublicContent } from '../../components/public/types';

type Props = { appName: string; authenticated: boolean; content: PublicContent };

export default function Home({ appName, authenticated, content }: Props) {
    return <>
        <Head title={`One Talibon — ${appName}`} />
        <div className="public-portal min-h-screen bg-[#eaf0f5] text-slate-900 dark:bg-[#0d1624] dark:text-slate-100">
            <a href="#public-content" className="sr-only z-[80] rounded bg-white p-3 text-blue-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
            <PublicHeader authenticated={authenticated} />
            <main id="public-content" tabIndex={-1} className="mx-auto max-w-[1600px] space-y-3 p-3 sm:p-4">
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><p><strong>{content.sampleLabel}</strong> · Public information preview for evaluation. Sample content is not official municipal reporting.</p>
                </div>
                <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_290px]">
                    <div className="min-w-0 space-y-3">
                        <PublicHero content={content} authenticated={authenticated} />
                        <div className="grid items-start gap-3 lg:grid-cols-[1.05fr_1fr]">
                            <div className="@container min-w-0"><PublicServices content={content} /></div>
                            <PublicGlance content={content} />
                        </div>
                        <PublicUpdates content={content} />
                    </div>
                    <PublicNewsRail content={content} />
                </div>
                <section id="about" className="municipal-panel flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
                    <Landmark size={27} className="shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                    <div><h2 className="text-sm font-bold">About {content.municipality}</h2><p className="mt-1 text-xs leading-6 text-slate-600 dark:text-slate-400">{content.hero.description}</p></div>
                </section>
            </main>
            <PublicFooter content={content} authenticated={authenticated} />
        </div>
    </>;
}
