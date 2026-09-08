import { CalendarDays, MapPin, Waves } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MunicipalContext() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 60000);
        return () => window.clearInterval(timer);
    }, []);
    const date = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'long', day: 'numeric' }).format(now);
    const weekday = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', weekday: 'long' }).format(now);
    return <aside className="municipal-panel flex flex-col justify-between p-5" aria-label="Municipal context">
        <div className="flex items-start justify-between gap-4">
            <div><div className="text-sm font-semibold">{weekday}</div><div className="mt-1 text-lg font-bold tracking-tight">{date}</div></div>
            <CalendarDays size={21} className="mt-1 shrink-0 text-blue-700 dark:text-blue-300" />
        </div>
        <div className="mt-5 flex items-center gap-3"><Waves size={34} className="text-cyan-600 dark:text-cyan-400" /><div><div className="flex items-center gap-1 text-xs font-semibold"><MapPin size={12} />Talibon, Bohol</div><div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Municipal operations · Philippine time</div></div></div>
        <p className="mt-5 border-t border-slate-200 pt-3 text-xs italic text-slate-500 dark:border-slate-700 dark:text-slate-400">People. Process. Progress. Together.</p>
    </aside>;
}
