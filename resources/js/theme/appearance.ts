export type AppearancePreference = 'system' | 'light' | 'dark';
export type ResolvedAppearance = 'light' | 'dark';

const STORAGE_KEY = 'talibon.appearance';
const validPreferences: AppearancePreference[] = ['system', 'light', 'dark'];

export function readAppearance(): AppearancePreference {
    if (typeof window === 'undefined') return 'system';

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return validPreferences.includes(stored as AppearancePreference)
        ? stored as AppearancePreference
        : 'system';
}

export function resolveAppearance(preference: AppearancePreference): ResolvedAppearance {
    if (preference !== 'system') return preference;
    if (typeof window === 'undefined') return 'light';

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyAppearance(preference: AppearancePreference): void {
    if (typeof document === 'undefined') return;

    const resolved = resolveAppearance(preference);
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.dataset.appearance = preference;
    root.style.colorScheme = resolved;
}

export function saveAppearance(preference: AppearancePreference): void {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, preference);
    }
    applyAppearance(preference);
}

export function initializeAppearance(): void {
    applyAppearance(readAppearance());
}

export function subscribeToSystemAppearance(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
}
