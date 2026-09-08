import { ArrowRight, Landmark, MapPin } from 'lucide-react';
import PublicPanel from './PublicPanel';
import type { PublicContent } from './types';

export default function PublicGlance({ content }: { content: PublicContent }) {
    return <PublicPanel id="about" title="About the municipality" icon={Landmark}>
        <div className="public-municipality">
            <h3>Talibon, Bohol</h3>
            <p>{content.hero.description}</p>
            <p className="public-location"><MapPin size={16} aria-hidden="true" />{content.contact.location}</p>
            <div className="public-info-links">
                <a href="#news">Municipal updates <ArrowRight size={15} aria-hidden="true" /></a>
                <a href="#contact">Contact information <ArrowRight size={15} aria-hidden="true" /></a>
            </div>
        </div>
    </PublicPanel>;
}
