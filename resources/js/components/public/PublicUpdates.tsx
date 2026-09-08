import { Building2, FileText, Megaphone } from 'lucide-react';
import type { PublicContent } from './types';

export default function PublicUpdates({ content }: { content: PublicContent }) {
    return <section className="public-updates" aria-label="Public updates and documents">
        <div id="news" className="public-update-column">
            <h2><Megaphone size={18} aria-hidden="true" />News & notices</h2>
            {content.news.map(item => <article key={item.title}>
                <div className="public-item-meta">{item.type}{item.date && item.date !== 'Prototype' ? ' · ' + item.date : ''}</div>
                <h3>{item.title}</h3><p>{item.summary}</p>
            </article>)}
            {!content.news.length && <p>No public updates available.</p>}
        </div>
        <div id="transparency" className="public-update-column">
            <h2><FileText size={18} aria-hidden="true" />Public documents</h2>
            {content.transparency.map(item => <article key={item.label}>
                <h3>{item.label}</h3><p>{item.note}</p>
            </article>)}
            {!content.transparency.length && <p>No public documents available.</p>}
        </div>
        <div id="projects" className="public-update-column">
            <h2><Building2 size={18} aria-hidden="true" />Projects & programs</h2>
            {content.projects.map(item => <article key={item.title}>
                <h3>{item.title}</h3><p>{item.summary}</p>
            </article>)}
            {!content.projects.length && <p>No project updates available.</p>}
        </div>
    </section>;
}
