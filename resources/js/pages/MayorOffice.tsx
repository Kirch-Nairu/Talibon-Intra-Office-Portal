import { Link, router } from '@inertiajs/react';
import { ArrowRight, Building2, Radio } from 'lucide-react';
import { useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';

type Tx = {
    id: number;
    reference_no: string;
    title: string;
    status: string;
    priority: string;
    origin_department: { name: string; short_name?: string };
};

type Props = {
    queue: Tx[];
    stats: {
        forApproval: number;
        forReview: number;
        highPriority: number;
        total: number;
    };
};

export default function MayorOffice({ queue, stats }: Props) {
    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            router.reload({
                only: ['queue', 'stats'],
                preserveScroll: true,
                preserveState: true,
            });
        };

        const timer = window.setInterval(refresh, 2000);
        window.addEventListener('focus', refresh);

        return () => {
            window.clearInterval(timer);
            window.removeEventListener('focus', refresh);
        };
    }, []);

    const cards = [
        ['For Approval', stats.forApproval],
        ['For Review', stats.forReview],
        ['High Priority', stats.highPriority],
        ['Active Queue', stats.total],
    ];

    return (
        <AppLayout title="Mayor's Office">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <section className="overflow-hidden rounded-2xl bg-[#0b2852] p-4 text-white shadow-lg sm:rounded-3xl sm:p-6 md:p-9">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                        <div>
                            <div className="flex items-center gap-2 text-blue-200 sm:gap-3">
                                <Building2 size={18} className="sm:h-[22px] sm:w-[22px]" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]">Executive command queue</span>
                            </div>
                            <h1 className="mt-3 text-2xl font-bold leading-tight sm:mt-4 sm:text-3xl md:text-4xl">Mayor's Office Review & Approval</h1>
                            <p className="mt-2 max-w-2xl text-[12px] leading-5 text-blue-100 sm:mt-3 sm:text-sm sm:leading-6">
                                Transactions routed by municipal departments arrive here with their prior office history preserved for review.
                            </p>
                        </div>
                        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-100 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs">
                            <Radio size={13} className="animate-pulse sm:h-[15px] sm:w-[15px]" />
                            Live queue · refreshes automatically
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                    {cards.map(([label, value]) => (
                        <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
                            <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</div>
                            <div className="mt-2 text-xl font-bold text-slate-950 sm:mt-3 sm:text-3xl">{value}</div>
                        </div>
                    ))}
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                    <div className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-5">
                        <h2 className="text-sm font-bold text-slate-950 sm:text-base">Items requiring executive attention</h2>
                        <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">New routed items appear automatically while this page remains open.</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {queue.map((tx) => (
                            <Link
                                key={tx.id}
                                href={`/transactions/${tx.id}`}
                                className="flex flex-col gap-2.5 px-4 py-3.5 transition hover:bg-blue-50/40 sm:gap-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-blue-700 sm:text-xs">{tx.reference_no}</div>
                                    <div className="mt-1 break-words text-sm font-semibold text-slate-950 sm:text-base">{tx.title}</div>
                                    <div className="mt-1 text-[11px] text-slate-500 sm:text-sm">
                                        Origin: {tx.origin_department.short_name || tx.origin_department.name}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 md:justify-end">
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase text-amber-800 sm:px-3 sm:py-1.5 sm:text-xs">
                                        {tx.status.replaceAll('_', ' ')}
                                    </span>
                                    <ArrowRight size={16} className="shrink-0 text-slate-400 sm:h-[18px] sm:w-[18px]" />
                                </div>
                            </Link>
                        ))}
                        {queue.length === 0 && (
                            <div className="p-7 text-center text-[12px] text-slate-500 sm:p-10 sm:text-sm">
                                No items currently require Mayor's Office review.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
