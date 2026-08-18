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
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="overflow-hidden rounded-3xl bg-[#0b2852] p-6 text-white shadow-xl md:p-9">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3 text-blue-200">
                                <Building2 size={22} />
                                <span className="text-xs font-bold uppercase tracking-[0.22em]">Executive command queue</span>
                            </div>
                            <h1 className="mt-4 text-3xl font-bold md:text-4xl">Mayor's Office Review & Approval</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                                Transactions routed by municipal departments arrive here with their prior office history preserved for review.
                            </p>
                        </div>
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                            <Radio size={15} className="animate-pulse" />
                            Live queue · refreshes automatically
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {cards.map(([label, value]) => (
                        <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</div>
                            <div className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">{value}</div>
                        </div>
                    ))}
                </section>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
                        <h2 className="font-bold text-slate-950">Items requiring executive attention</h2>
                        <p className="mt-1 text-xs text-slate-500">New routed items appear automatically while this page remains open.</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {queue.map((tx) => (
                            <Link
                                key={tx.id}
                                href={`/transactions/${tx.id}`}
                                className="flex flex-col gap-4 px-5 py-5 transition hover:bg-blue-50/40 sm:px-6 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-blue-700">{tx.reference_no}</div>
                                    <div className="mt-1 break-words font-semibold text-slate-950">{tx.title}</div>
                                    <div className="mt-1 text-sm text-slate-500">
                                        Origin: {tx.origin_department.short_name || tx.origin_department.name}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 md:justify-end">
                                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase text-amber-800">
                                        {tx.status.replaceAll('_', ' ')}
                                    </span>
                                    <ArrowRight size={18} className="shrink-0 text-slate-400" />
                                </div>
                            </Link>
                        ))}
                        {queue.length === 0 && (
                            <div className="p-10 text-center text-sm text-slate-500">
                                No items currently require Mayor's Office review.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
