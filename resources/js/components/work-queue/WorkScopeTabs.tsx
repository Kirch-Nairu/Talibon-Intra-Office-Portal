import type { ScopeGroup } from './types';

export default function WorkScopeTabs({ groups, currentView, onSelect }: {
    groups: ScopeGroup[];
    currentView: string;
    onSelect: (view: string) => void;
}) {
    return (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4" aria-label="Work queue scopes">
            {groups.map((group) => (
                <div key={group.key}>
                    <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">{group.label}</div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {group.views.map((view) => {
                            const active = view.key === currentView;
                            return (
                                <button
                                    key={view.key}
                                    type="button"
                                    onClick={() => onSelect(view.key)}
                                    aria-pressed={active}
                                    className={`shrink-0 rounded-xl border px-3 py-2 text-left transition sm:px-3.5 ${active ? 'border-blue-800 bg-blue-50 text-blue-950' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="text-[10px] font-bold sm:text-xs">{view.label}</div>
                                    <div className={`mt-0.5 text-[9px] sm:text-[10px] ${active ? 'text-blue-700' : 'text-slate-400'}`}>{view.count} item{view.count === 1 ? '' : 's'}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </section>
    );
}
