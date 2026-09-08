import { Bookmark, Building2, FileCheck2, FileText, Megaphone, ShieldCheck, Users } from 'lucide-react';
import PublicPanel from './PublicPanel';
import type { PublicContent } from './types';

const serviceIcons = [FileCheck2, Users, FileText, Megaphone, Building2, ShieldCheck];
export default function PublicServices({ content }: { content: PublicContent }) {
    return <PublicPanel id="services" title="Municipal services" icon={Bookmark}>
        <div className="public-service-grid">
            {content.services.map((service, index) => {
                const Icon = serviceIcons[index % serviceIcons.length];
                return <article key={service.title} className="public-service-tile">
                    <Icon size={24} aria-hidden="true" />
                    <div><h3>{service.title}</h3><p>{service.description}</p></div>
                </article>;
            })}
        </div>
        <a href="#contact" className="municipal-link public-panel-link">Service enquiries →</a>
    </PublicPanel>;
}
