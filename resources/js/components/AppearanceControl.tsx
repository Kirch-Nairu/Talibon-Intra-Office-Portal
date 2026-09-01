import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    applyAppearance,
    type AppearancePreference,
    readAppearance,
    saveAppearance,
    subscribeToSystemAppearance,
} from '../theme/appearance';

const choices: Array<{ value: AppearancePreference; label: string; icon: typeof Monitor }> = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
];

export default function AppearanceControl() {
    const [appearance, setAppearance] = useState<AppearancePreference>(() => readAppearance());

    useEffect(() => {
        applyAppearance(appearance);
        if (appearance !== 'system') return;

        return subscribeToSystemAppearance(() => applyAppearance('system'));
    }, [appearance]);

    const choose = (value: AppearancePreference) => {
        setAppearance(value);
        saveAppearance(value);
    };

    return (
        <div>
            <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-300">Appearance</div>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-white/5 p-1" role="group" aria-label="Appearance">
                {choices.map(({ value, label, icon: Icon }) => {
                    const active = appearance === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => choose(value)}
                            aria-pressed={active}
                            className={`flex min-h-9 items-center justify-center gap-1 rounded-md px-2 text-[10px] font-semibold transition ${active ? 'bg-white text-[#0b2852]' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}
                        >
                            <Icon size={13} aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
