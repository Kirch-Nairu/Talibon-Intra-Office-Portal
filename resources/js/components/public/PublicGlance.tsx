import { BarChart3, Building2, Files, Info, Megaphone } from 'lucide-react';
import PublicPanel from './PublicPanel';
import type { PublicContent } from './types';

const icons = [Building2, Info, Files, Megaphone];
export default function PublicGlance({ content }: { content: PublicContent }) {
    return <PublicPanel id="dashboards" title="Talibon at a Glance" icon={BarChart3}>
        <div className="public-facts-grid">
            {content.dashboard.map((item, index) => {
                const Icon = icons[index % icons.length];
                return <article key={item.label} className="public-fact">
                    <Icon size={26} aria-hidden="true" />
                    <div><h3>{item.label}</h3><strong>{item.value}</strong><p>{item.detail}</p></div>
                </article>;
            })}
        </div>
        <p className="public-panel-note">Sample information · Not official municipal statistics</p>
    </PublicPanel>;
}
