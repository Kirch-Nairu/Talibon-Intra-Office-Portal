import { Monitor, Moon, Sun } from 'lucide-react';
import { useAppearance } from '../theme/useAppearance';
import type { AppearancePreference } from '../theme/appearance';

const choices: Array<{ value: AppearancePreference; label: string; icon: typeof Monitor }> = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
];

export default function AppearanceControl({ publicSurface = false }: { publicSurface?: boolean }) {
    const { appearance, choose } = useAppearance();
    return <div>
        {!publicSurface && <div className="mb-2 text-xs font-semibold text-blue-300">Appearance</div>}
        <div className={`grid grid-cols-3 gap-1 rounded-lg border p-1 ${publicSurface ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800' : 'border-white/10 bg-white/5'}`} role="group" aria-label="Appearance">
            {choices.map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => choose(value)} aria-pressed={appearance === value} className={`flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-semibold transition-colors duration-150 ${appearance === value ? 'bg-white text-[#0b2852]' : publicSurface ? 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
                <Icon size={14} aria-hidden="true" /><span >{label}</span>
            </button>)}
        </div>
    </div>;
}
