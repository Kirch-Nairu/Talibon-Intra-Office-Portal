import { Link } from '@inertiajs/react';
import { Landmark, MapPin } from 'lucide-react';
import MunicipalBrand from '../MunicipalBrand';
import type { PublicContent } from './types';

export default function PublicFooter({ content, authenticated }: { content: PublicContent; authenticated: boolean }) {
    return <footer id="contact" className="border-t-2 border-[#e5b63a] bg-[#0b2852] text-white">
        <div className="public-footer-grid">
            <div>
                <h2 className="text-sm font-bold">{content.contact.heading}</h2>
                <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-blue-100"><MapPin size={15} className="mt-0.5 shrink-0" />{content.contact.location}</p>
                <p className="mt-2 max-w-md text-sm leading-5 text-blue-200">{content.contact.description}</p>
            </div>
            <nav aria-label="Footer links" className="border-white/20 sm:border-l sm:pl-6">
                <h2 className="text-sm font-semibold">Quick Links</h2>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-100">
                    <a href="#services" className="flex min-h-8 items-center hover:underline">Services</a><a href="#transparency" className="flex min-h-8 items-center hover:underline">Transparency</a>
                    <a href="#news" className="flex min-h-8 items-center hover:underline">News & Events</a><a href="#about" className="flex min-h-8 items-center hover:underline">About Talibon</a>
                    <Link href={authenticated ? '/dashboard' : '/login'} className="col-span-2 flex min-h-8 items-center hover:underline">{authenticated ? 'Employee Portal' : 'Employee Login'} →</Link>
                </div>
            </nav>
            <div className="sm:col-span-2 xl:col-span-1 xl:border-l xl:border-white/20 xl:pl-6">
                <MunicipalBrand inverse publicPortal />
                <div className="mt-2 flex items-center gap-2 text-xs text-blue-200"><Landmark size={14} />{content.municipality}</div>
                <p className="mt-2 text-xs text-blue-200">Public prototype presentation</p>
            </div>
        </div>
    </footer>;
}
