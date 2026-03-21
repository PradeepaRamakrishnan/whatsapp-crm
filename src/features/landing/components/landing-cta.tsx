'use client';

import { useGSAP } from '@gsap/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useRef } from 'react';
import { siteConfig } from '@/config/site';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP as never);

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Contact Us', href: '#' },
  { label: 'Documentation', href: '#' },
];

export const LandingCta = () => {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.to('.cta-orb', {
        scale: 1.15,
        duration: 7,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="cta"
      className="relative overflow-hidden px-4 pb-0 pt-28 sm:px-6 lg:px-8"
      style={{ background: 'var(--ls-bg)' }}
    >
      {/* Top divider */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(124,58,237,0.4), rgba(34,211,238,0.3), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl">
        {/* CTA card */}
        <div
          className="relative overflow-hidden rounded-3xl p-12 text-center lg:p-20"
          style={{
            background: 'var(--ls-card)',
            border: '1px solid var(--ls-card-border)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Card inner glow orb */}
          <div
            className="cta-orb pointer-events-none absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
            style={{
              background:
                'radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(59,130,246,0.1) 50%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          {/* Top-left accent corner */}
          <div
            className="pointer-events-none absolute top-0 left-0 size-48 rounded-3xl"
            style={{
              background:
                'radial-gradient(circle at 0% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          {/* Bottom-right accent */}
          <div
            className="pointer-events-none absolute right-0 bottom-0 size-48 rounded-3xl"
            style={{
              background:
                'radial-gradient(circle at 100% 100%, rgba(34,211,238,0.1) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          {/* Gradient top border */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(124,58,237,0.6) 30%, rgba(34,211,238,0.4) 70%, transparent)',
            }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative">
            <div
              className="cta-badge mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#a78bfa',
              }}
            >
              <span
                className="size-1.5 animate-pulse rounded-full"
                style={{ background: '#7c3aed' }}
              />
              No credit card required · Free forever plan
            </div>

            <h2
              className="cta-title mx-auto mb-6 max-w-3xl font-black leading-tight tracking-tighter text-foreground"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
            >
              Ready to grow your{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                campaigns?
              </span>
            </h2>

            <p
              className="cta-sub mx-auto mb-10 max-w-xl text-lg leading-relaxed"
              style={{ color: 'var(--ls-muted)' }}
            >
              Start sending smarter, faster, more personal campaigns with {siteConfig.name} — and
              see results from day one.
            </p>

            {/* Buttons */}
            <div className="cta-buttons mb-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                  boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 4px 24px rgba(0,0,0,0.4)',
                }}
              >
                Get started free
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </Link>
              <a
                href="mailto:sales@example.com"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-white/10"
                style={{
                  background: 'var(--ls-card)',
                  border: '1px solid var(--ls-card-border)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                Talk to sales
              </a>
            </div>

            {/* Feature checklist */}
            <div className="cta-features flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {['Free 14-day trial', 'No setup fees', 'Cancel anytime', '24/7 support'].map(
                (feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: '#34d399' }}>
                      ✓
                    </span>
                    <span className="text-sm" style={{ color: 'var(--ls-muted)' }}>
                      {feat}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pb-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black tracking-widest text-foreground uppercase">
                {siteConfig.brand.line1}
              </span>
              <span
                className="h-3.5 w-px"
                style={{ background: 'linear-gradient(to bottom, #7c3aed, #3b82f6)' }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-sm font-black tracking-widest uppercase"
                style={{
                  background: 'linear-gradient(to right, #7c3aed, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {siteConfig.brand.line2}
              </span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs transition-colors hover:text-foreground"
                  style={{ color: 'var(--ls-subtle)' }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Copyright */}
            <p
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--ls-faint)' }}
            >
              {siteConfig.copyright} {siteConfig.name}
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
};
