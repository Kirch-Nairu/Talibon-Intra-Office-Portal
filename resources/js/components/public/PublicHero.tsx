import { Link } from '@inertiajs/react';
import { ArrowRight, LogIn } from 'lucide-react';
import { talibonAssets } from '../../branding/talibonAssets';
import type { PublicContent } from './types';

export default function PublicHero({ content, authenticated }: { content: PublicContent; authenticated: boolean }) {
    return <section id="home" className="public-hero">
        <div className="public-hero-intro">
            <div className="public-hero-copy">
                <p className="public-welcome">One Talibon Digital Portal</p>
                <h1 className="public-hero-title">Welcome to<br />Talibon, Bohol.</h1>
                <p className="public-hero-lead">{content.hero.lead}</p>
                <Link href={authenticated ? '/dashboard' : '/login'} className="public-primary-action"><LogIn size={17} aria-hidden="true" />{authenticated ? 'Open employee portal' : 'Employee Login'}<ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            <div className="public-hero-landscape"><img src={talibonAssets.publicHero} alt="" /></div>
        </div>
        <nav className="public-destinations" aria-label="Public information shortcuts">
            <a href="#services">Municipal services <ArrowRight size={16} aria-hidden="true" /></a>
            <a href="#news">News & notices <ArrowRight size={16} aria-hidden="true" /></a>
            <a href="#transparency">Public documents <ArrowRight size={16} aria-hidden="true" /></a>
        </nav>
    </section>;
}
