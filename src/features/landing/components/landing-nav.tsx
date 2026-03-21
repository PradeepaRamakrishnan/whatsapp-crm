'use client';

import { useGSAP } from '@gsap/react';
import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ThemeModeToggle } from '@/components/shared/theme-toggle';
import { siteConfig } from '@/config/site';

gsap.registerPlugin(useGSAP as never);

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Stats', href: '#stats' },
];

interface LandingNavProps {
  activeSection?: string;
}

export const LandingNav = ({ activeSection = '' }: LandingNavProps) => {
  const ref = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    () => {
      gsap.from(ref.current, {
        y: -80,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
      });
    },
    { scope: ref },
  );

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      ref={ref}
      className="fixed top-0 right-0 left-0 z-50 border-b"
      style={{
        background: 'var(--ls-nav)',
        borderColor: 'var(--ls-card-border)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 select-none"
          aria-label="Campaign CRM home"
        >
          <span className="font-mono text-base font-black tracking-[0.14em] text-foreground uppercase">
            {siteConfig.brand.line1}
          </span>
          <span
            className="h-4 w-px shrink-0"
            style={{ background: 'var(--ls-card-border)' }}
            aria-hidden="true"
          />
          <span className="font-mono text-base font-black tracking-[0.14em] text-foreground uppercase">
            {siteConfig.brand.line2}
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="relative px-4 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive ? 'var(--foreground)' : 'var(--ls-muted)',
                  borderRadius: '10px',
                  background: isActive ? 'var(--ls-card-hover)' : 'transparent',
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    className="absolute bottom-0.5 left-1/2 h-px w-5 -translate-x-1/2"
                    style={{ background: 'var(--foreground)' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <ThemeModeToggle />
          </div>
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:opacity-80 hover:-translate-y-px md:inline-flex"
            style={{
              background: 'var(--foreground)',
              color: 'var(--background)',
            }}
          >
            Get Started
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg border md:hidden"
            style={{
              border: '1px solid var(--ls-card-border)',
              background: 'var(--ls-card)',
              color: 'var(--foreground)',
            }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle mobile menu"
            aria-expanded={menuOpen}
          >
            <HugeiconsIcon icon={menuOpen ? Cancel01Icon : Menu01Icon} size={17} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className="overflow-hidden transition-all duration-300 md:hidden"
        style={{
          maxHeight: menuOpen ? '340px' : '0px',
          borderTop: menuOpen ? '1px solid var(--ls-card-border)' : 'none',
        }}
      >
        <div className="flex flex-col gap-1 px-4 py-4" style={{ background: 'var(--ls-bg)' }}>
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => scrollTo(link.href)}
              className="rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors"
              style={{ color: 'var(--ls-muted)' }}
            >
              {link.label}
            </button>
          ))}
          <div className="my-2 h-px w-full" style={{ background: 'var(--ls-card-border)' }} />
          <div className="flex items-center justify-between px-2 py-1">
            <ThemeModeToggle />
            <Link
              href="/login"
              className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ background: 'var(--foreground)', color: 'var(--background)' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
