import { X } from 'lucide-react';
import { useEffect, useRef, type PropsWithChildren } from 'react';

export default function MobileNavigation({ children, onClose }: PropsWithChildren<{ onClose: () => void }>) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const element = dialog.current;
        const previousOverflow = document.body.style.overflow;
        element?.showModal();
        document.body.style.overflow = 'hidden';
        return () => {
            element?.close();
            document.body.style.overflow = previousOverflow;
        };
    }, []);
    return <dialog ref={dialog} onCancel={onClose} aria-label="Municipal navigation" className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 text-white backdrop:bg-slate-950/55 lg:hidden">
        <button type="button" onClick={onClose} className="absolute inset-0" aria-label="Dismiss navigation backdrop" tabIndex={-1} />
        <aside className="relative h-full w-[84%] max-w-[290px] shadow-2xl">{children}</aside>
        <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-full bg-white p-2 text-slate-900 shadow dark:bg-slate-800 dark:text-slate-100" aria-label="Close navigation"><X size={18} /></button>
    </dialog>;
}
