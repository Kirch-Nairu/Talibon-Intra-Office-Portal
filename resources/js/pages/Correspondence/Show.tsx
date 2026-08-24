import { Link } from '@inertiajs/react';
import { ArrowLeft, Building2, CalendarClock, FileText, GitBranch, UserRound } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';

type Office = { code: string; name: string; shortName?: string | null };
type Employee = { employeeNumber: string; name: string; position?: string | null };
type Workflow = {
    reference: string;
    status: string;
    currentOffice?: Office | null;
    assignedEmployee?: Employee | null;
    detailUrl?: string | null;
};
type TimelineEvent = {
    event: string;
    previousState?: string | null;
    newState: string;
    actor?: { type: 'human' | 'integration'; name: string } | null;
    office?: Office | null;
    remarks?: string | null;
    occurredAt?: string | null;
};
type Props = {
    correspondence: {
        publicId: string;
        reference: string;
        municipalReference?: string | null;
        externalReference: string;
        lifecycleState: string;
        classification?: string | null;
        source: {
            senderName: string;
            senderOrganization?: string | null;
            source: string;
            channel?: string | null;
        };
        content: { subject: string; summary?: string | null };
        accountability: {
            currentOffice?: Office | null;
            receivingOffice?: Office | null;
            workflow?: Workflow | null;
        };
        dates: {
            receivedAt?: string | null;
            registeredAt?: string | null;
            classifiedAt?: string | null;
            routedAt?: string | null;
            actionStartedAt?: string | null;
        };
    };
    timeline: TimelineEvent[];
    capabilities: {
        canRegister: boolean;
        canClassify: boolean;
        canRoute: boolean;
        canAct: boolean;
    };
};

const humanize = (value?: string | null) => value
    ? value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Not yet completed';

const formatDate = (value?: string | null) => value
    ? new Date(value).toLocaleString()
    : 'Not yet completed';

const lifecycleTone: Record<string, string> = {
    received: 'bg-blue-50 text-blue-800',
    registered: 'bg-slate-100 text-slate-700',
    classified: 'bg-violet-50 text-violet-800',
    routed: 'bg-amber-50 text-amber-800',
    in_action: 'bg-emerald-50 text-emerald-800',
};

const classificationTone: Record<string, string> = {
    public: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    internal: 'border-slate-200 bg-slate-50 text-slate-700',
    confidential: 'border-amber-200 bg-amber-50 text-amber-800',
    restricted: 'border-rose-200 bg-rose-50 text-rose-800',
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="grid gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[150px_1fr] sm:gap-4">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-[11px]">{label}</div>
            <div className="text-[12px] font-medium text-slate-800 sm:text-sm">{value || 'Not yet completed'}</div>
        </div>
    );
}

export default function CorrespondenceShow({ correspondence, timeline }: Props) {
    const workflow = correspondence.accountability.workflow;
    const currentOffice = correspondence.accountability.currentOffice;
    const receivingOffice = correspondence.accountability.receivingOffice;

    return (
        <AppLayout title={`Correspondence · ${correspondence.reference}`}>
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
                <Link href="/correspondence" className="inline-flex items-center gap-2 text-[11px] font-semibold text-blue-700 hover:text-blue-900 sm:text-xs">
                    <ArrowLeft size={15} /> Back to Correspondence Inbox
                </Link>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">Municipal correspondence record</div>
                            <h1 className="mt-2 break-words text-xl font-bold text-slate-950 sm:text-2xl">{correspondence.reference}</h1>
                            <p className="mt-2 max-w-3xl text-[13px] font-semibold leading-5 text-slate-800 sm:text-base">{correspondence.content.subject}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold sm:text-xs ${lifecycleTone[correspondence.lifecycleState] || 'bg-slate-100 text-slate-700'}`}>
                                {humanize(correspondence.lifecycleState)}
                            </span>
                            {correspondence.classification && (
                                <span className={`rounded-full border px-3 py-1.5 text-[10px] font-bold sm:text-xs ${classificationTone[correspondence.classification] || 'border-slate-200 bg-white text-slate-700'}`}>
                                    {humanize(correspondence.classification)}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:gap-6">
                    <div className="space-y-4 sm:space-y-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><FileText size={17} /> Correspondence</div>
                            <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-[11px]">Summary</div>
                                <p className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-slate-700 sm:text-sm sm:leading-6">{correspondence.content.summary || 'No summary recorded.'}</p>
                            </div>
                            <div className="mt-4">
                                <DetailRow label="Sender" value={correspondence.source.senderName} />
                                <DetailRow label="Organization" value={correspondence.source.senderOrganization || 'Not specified'} />
                                <DetailRow label="Source" value={humanize(correspondence.source.source)} />
                                <DetailRow label="Channel" value={correspondence.source.channel ? humanize(correspondence.source.channel) : 'Not specified'} />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><CalendarClock size={17} /> Lifecycle timeline</div>
                            <div className="mt-5 space-y-0">
                                {timeline.map((event, index) => (
                                    <div key={`${event.event}-${event.occurredAt || index}`} className="relative pl-7 pb-5 last:pb-0">
                                        {index < timeline.length - 1 && <div className="absolute left-[7px] top-3 h-full w-px bg-slate-200" />}
                                        <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-700 shadow-sm ring-1 ring-blue-200" />
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                            <div>
                                                <div className="text-[12px] font-bold text-slate-900 sm:text-sm">{humanize(event.event)}</div>
                                                <div className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                                                    {event.previousState ? `${humanize(event.previousState)} → ` : ''}{humanize(event.newState)}
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-[10px] text-slate-400 sm:text-xs">{formatDate(event.occurredAt)}</div>
                                        </div>
                                        <div className="mt-2 text-[11px] text-slate-600 sm:text-xs">
                                            <span className="font-semibold text-slate-700">{event.actor?.name || 'System event'}</span>
                                            {event.office && <span> · {event.office.shortName || event.office.name}</span>}
                                        </div>
                                        {event.remarks && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-600 sm:text-xs">{event.remarks}</p>}
                                    </div>
                                ))}
                                {timeline.length === 0 && <div className="py-6 text-center text-xs text-slate-400">No lifecycle events recorded yet.</div>}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Building2 size={17} /> Record identity</div>
                            <div className="mt-3">
                                <DetailRow label="Municipal reference" value={correspondence.municipalReference} />
                                <DetailRow label="External reference" value={correspondence.externalReference} />
                                <DetailRow label="Lifecycle" value={humanize(correspondence.lifecycleState)} />
                                <DetailRow label="Classification" value={correspondence.classification ? humanize(correspondence.classification) : 'Not yet completed'} />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><UserRound size={17} /> Current accountability</div>
                            <div className="mt-3">
                                <DetailRow label="Receiving office" value={receivingOffice?.shortName || receivingOffice?.name || 'Not yet assigned'} />
                                <DetailRow label="Current office" value={currentOffice?.shortName || currentOffice?.name || 'Unregistered intake'} />
                                <DetailRow label="Workflow reference" value={workflow?.reference} />
                                <DetailRow label="Workflow status" value={workflow ? humanize(workflow.status) : null} />
                                <DetailRow label="Responsible employee" value={workflow?.assignedEmployee?.name || 'Unassigned'} />
                                <DetailRow label="Position" value={workflow?.assignedEmployee?.position} />
                            </div>
                            {workflow?.detailUrl && (
                                <Link href={workflow.detailUrl} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 sm:text-xs">
                                    <GitBranch size={14} /> Open linked workflow
                                </Link>
                            )}
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><CalendarClock size={17} /> Record dates</div>
                            <div className="mt-3">
                                <DetailRow label="Received" value={formatDate(correspondence.dates.receivedAt)} />
                                <DetailRow label="Registered" value={formatDate(correspondence.dates.registeredAt)} />
                                <DetailRow label="Classified" value={formatDate(correspondence.dates.classifiedAt)} />
                                <DetailRow label="Routed" value={formatDate(correspondence.dates.routedAt)} />
                                <DetailRow label="Action started" value={formatDate(correspondence.dates.actionStartedAt)} />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
