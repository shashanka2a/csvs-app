import Link from 'next/link';
import { Flower2, Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const matrimonyLinks = [
  { label: 'Search Profiles', href: '/matrimony' },
  { label: 'Premium Membership', href: '/matrimony' },
  { label: 'Success Stories', href: '/articles' },
  { label: 'Privacy Policy', href: '#' },
];

const communityLinks = [
  { label: 'About Sangham', href: '/members' },
  { label: 'Event Gallery', href: '/gallery' },
  { label: 'Make a Donation', href: '#' },
  { label: 'Area Representatives', href: '/members' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t-4 border-brand-red pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flower2 className="text-brand-gold w-8 h-8" />
              <span className="font-serif text-2xl text-white font-bold">CSVS</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Preserving tradition, fostering community, and celebrating heritage across generations.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-brand-gold transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-brand-gold transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-brand-gold transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Matrimony */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Matrimony
            </h4>
            <ul className="space-y-2">
              {matrimonyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand-gold text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Community */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Community
            </h4>
            <ul className="space-y-2">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand-gold text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-gold w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">
                  CSVS Head Office, Hyderabad, Telangana, India.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-brand-gold w-4 h-4 shrink-0" />
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand-gold w-4 h-4 shrink-0" />
                <span className="text-gray-400 text-sm">support@csvs.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2026 Chattada Sri Vaishnava Sangham (CSVS). All rights reserved. Designed for Trust &amp; Tradition.
          </p>
        </div>
      </div>
    </footer>
  );
}
