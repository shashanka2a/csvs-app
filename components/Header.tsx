'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Members', href: '/members' },
  { label: 'Events', href: '/events' },
  { label: 'Matrimony', href: '/matrimony' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Articles', href: '/articles' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="w-9 h-9 rounded-md shadow-sm shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-serif font-bold text-xl text-brand-red">CSVS</span>
              <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                Chattada Sri Vaishnava Sangham
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? 'text-brand-red border-b-2 border-brand-red pb-0.5 text-sm font-semibold'
                      : 'text-brand-dark text-sm font-medium hover:text-brand-red transition-colors'
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Button (desktop) */}
          <div className="hidden md:flex items-center">
            <Link
              href="#"
              className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-redhover px-6 py-2 rounded-md shadow-sm text-sm font-medium transition-colors"
            >
              <User className="w-4 h-4" />
              Login
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-brand-dark p-1"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-brand-border px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    active
                      ? 'text-brand-red font-semibold py-2 px-3 rounded-md bg-red-50'
                      : 'text-brand-dark font-medium py-2 px-3 rounded-md hover:bg-gray-50 hover:text-brand-red transition-colors'
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="#"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-2 bg-brand-red text-white hover:bg-brand-redhover px-6 py-2 rounded-md shadow-sm text-sm font-medium transition-colors w-full justify-center"
            >
              <User className="w-4 h-4" />
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
