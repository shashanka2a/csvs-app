'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import Logo from '@/components/Logo';
import { DEFAULT_CONTENT, getStoredContent, SiteContent } from '@/lib/contentStore';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Members', href: '/members' },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Matrimony', href: '/matrimony' },
  { label: 'Contact Us', href: '#contact' },
];

export default function Footer() {
  const pathname = usePathname();
  const [contact, setContact] = useState<SiteContent['contact']>(DEFAULT_CONTENT.contact);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadContent = () => setContact(getStoredContent().contact);
      loadContent();
      window.addEventListener('csvs_content_updated', loadContent);
      return () => window.removeEventListener('csvs_content_updated', loadContent);
    }
  }, []);

  // Hide public footer on Admin Portal
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer id="contact" className="bg-brand-dark border-t-4 border-brand-red pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="md:pr-4">
            <div className="flex items-center gap-3 mb-3">
              <Logo className="w-10 h-10 rounded-md shrink-0 shadow" />
              <div className="flex flex-col">
                <span className="font-serif text-2xl text-white font-bold leading-tight">CSVS</span>
                <span className="text-[11px] uppercase tracking-wider text-gray-400">
                  Chattada Sri Vaishnava Sangham
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Preserving tradition, fostering community, and celebrating sacred heritage across generations.
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
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-brand-gold transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:pl-6">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
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

          {/* Column 3: Contact Us */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <User className="text-brand-gold w-4 h-4 shrink-0" />
                <span className="text-white text-sm font-semibold">
                  {contact.personName}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-gold w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">
                  {contact.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-brand-gold w-4 h-4 shrink-0" />
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="text-gray-400 text-sm hover:text-white transition-colors font-medium"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand-gold w-4 h-4 shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  {contact.email}
                </a>
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
