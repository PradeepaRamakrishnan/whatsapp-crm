'use client';

import { useGSAP } from '@gsap/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRef } from 'react';
import { siteConfig } from '@/config/site';

gsap.registerPlugin(useGSAP as never);

const TITLE_WORDS = ['Run', 'Campaigns', 'That', 'Actually'];

const BAR_HEIGHTS = [40, 72, 55, 88, 63, 76];
const BAR_COLORS = ['#111', '#222', '#444', '#111', '#222', '#444'];

export const LandingHero = () => {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Ambient orb drift
      gsap.to('.orb-hero-a', {
        x: 80,
        y: 60,
        duration: 12,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('.orb-hero-b', {
        x: -60,
        y: -80,
        duration: 15,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 4,
      });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.25 });

      tl.from('.hero-badge', { opacity: 0, y: -16, duration: 0.55 })
        .from('.hero-word', { opacity: 0, y: 72, skewY: 4, stagger: 0.09, duration: 0.7 }, '-=0.25')
        .from('.hero-word-accent', { opacity: 0, y: 72, skewY: 4, duration: 0.7 }, '-=0.45')
        .from('.hero-sub', { opacity: 0, y: 24, duration: 0.5 }, '-=0.3')
        .from('.hero-cta-primary', { opacity: 0, y: 18, duration: 0.45 }, '-=0.25')
        .from('.hero-cta-secondary', { opacity: 0, y: 18, duration: 0.45 }, '-=0.35')
        .from('.hero-social-proof', { opacity: 0, y: 14, duration: 0.4 }, '-=0.3')
        .from('.hero-mockup', { opacity: 0, x: 80, duration: 0.85, ease: 'power2.out' }, '-=0.7');
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen overflow-hidden px-4 pt-16 sm:px-6 lg:px-8"
      style={{ background: 'var(--ls-bg)' }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="orb-hero-a absolute -top-48 -left-48 size-[700px] rounded-full blur-[140px]"
          style={{ background: 'rgba(0,0,0,0.05)' }}
        />
        <div
          className="orb-hero-b absolute -right-32 bottom-0 size-[560px] rounded-full blur-[160px]"
          style={{ background: 'rgba(0,0,0,0.03)' }}
        />
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '200px',
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Main content: split layout */}
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-12 py-24 lg:flex-row lg:gap-20">
        {/* LEFT: text */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          {/* Badge */}
          <div
            className="hero-badge mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold"
            style={{
              background: 'var(--ls-card)',
              border: '1px solid var(--ls-card-border)',
              color: 'var(--ls-muted)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* shimmer */}
            <span
              className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite]"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 50%, transparent 100%)',
              }}
            />
            <span className="relative size-1.5 rounded-full bg-foreground/40" />
            <span className="relative">✦ Introducing Campaign Analytics 2.0</span>
          </div>

          {/* H1 */}
          <h1
            className="mb-6 overflow-hidden font-black leading-[1.02] tracking-tighter text-foreground"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
          >
            {TITLE_WORDS.map((word) => (
              <span key={word} className="hero-word mr-[0.22em] inline-block">
                {word}
              </span>
            ))}
            <br className="hidden sm:block" />
            <span className="hero-word-accent inline-block text-foreground/60">Convert.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-sub mb-10 max-w-lg text-lg leading-relaxed"
            style={{ color: 'var(--ls-muted)' }}
          >
            {siteConfig.tagline}. One platform to launch, manage and optimise multi-channel
            campaigns at scale — with real-time analytics that actually matter.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/login"
              className="hero-cta-primary inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-bold transition-all duration-200 hover:opacity-80 hover:-translate-y-0.5"
              style={{
                background: 'var(--foreground)',
                color: 'var(--background)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              Start for free
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </Link>
            <button
              type="button"
              onClick={() =>
                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="hero-cta-secondary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-black/5"
              style={{
                background: 'var(--ls-card)',
                border: '1px solid var(--ls-card-border)',
                backdropFilter: 'blur(12px)',
              }}
            >
              See features
            </button>
          </div>

          {/* Channel badges */}
          <div className="hero-social-proof mt-10 flex flex-wrap items-center gap-2">
            {[
              { label: 'WhatsApp', color: '#34d399' },
              { label: 'SMS', color: 'var(--ls-muted)' },
              { label: 'Email', color: 'var(--ls-muted)' },
            ].map(({ label, color }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{
                  background: 'var(--ls-card)',
                  border: '1px solid var(--ls-card-border)',
                  color,
                }}
              >
                <span className="size-1.5 rounded-full" style={{ background: color }} />
                {label}
              </span>
            ))}
            <span className="text-[11px]" style={{ color: 'var(--ls-faint)' }}>
              · All channels, one platform
            </span>
          </div>
        </div>

        {/* RIGHT: visual mockup */}
        <div className="hero-mockup relative flex flex-1 items-center justify-center lg:justify-end">
          {/* Main floating dashboard card */}
          <div
            className="relative w-full max-w-sm rounded-2xl p-5 lg:rotate-2"
            style={{
              background: 'var(--ls-card)',
              border: '1px solid var(--ls-card-border)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
            }}
          >
            {/* Card header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Q4 Outreach Campaign</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--ls-subtle)' }}>
                  WhatsApp · Started 3 days ago
                </p>
              </div>
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}
              >
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            {/* Mini stats row */}
            <div
              className="mb-5 grid grid-cols-3 gap-2 rounded-xl p-3"
              style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-hairline)' }}
            >
              {[
                { label: 'Sent', value: '12,400' },
                { label: 'Delivered', value: '94.2%' },
                { label: 'Replies', value: '847' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-base font-black text-foreground">{s.value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--ls-subtle)' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="mb-4">
              <p
                className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--ls-subtle)' }}
              >
                Daily deliveries
              </p>
              <div className="flex h-20 items-end gap-2">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={`bar-${h}`}
                    className="flex-1 rounded-t-md transition-all duration-300"
                    style={{
                      height: `${h}%`,
                      background: BAR_COLORS[i],
                      opacity: i === 4 || i === 5 ? 0.3 : 0.7,
                    }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span
                    key={d}
                    className="flex-1 text-center text-[9px]"
                    style={{ color: 'var(--ls-faint)' }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="mb-1.5 flex justify-between text-[10px]">
                <span style={{ color: 'var(--ls-subtle)' }}>Campaign progress</span>
                <span style={{ color: 'var(--foreground)' }}>68%</span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: 'var(--ls-card-border)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: '68%', background: 'var(--foreground)' }}
                />
              </div>
            </div>
          </div>

          {/* Floating notification card (top-right) */}
          <div
            className="absolute -top-6 -right-4 flex w-52 items-center gap-2.5 rounded-2xl p-3 lg:-right-8"
            style={{
              background: 'var(--ls-card-hover)',
              border: '1px solid var(--ls-card-border)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: 'var(--foreground)', color: 'var(--background)' }}
            >
              RM
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-foreground">
                New reply from Rajesh M.
              </p>
              <p className="text-[10px]" style={{ color: 'var(--ls-subtle)' }}>
                Just now
              </p>
            </div>
            <span className="size-2 shrink-0 rounded-full bg-foreground/30" />
          </div>

          {/* Floating metric card (bottom-left) */}
          <div
            className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl p-3.5 lg:-left-8"
            style={{
              background: 'var(--ls-card-hover)',
              border: '1px solid var(--ls-card-border)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <div
              className="flex size-9 items-center justify-center rounded-xl"
              style={{ background: 'var(--ls-card)' }}
            >
              <span style={{ color: 'var(--foreground)', fontSize: '16px' }}>↑</span>
            </div>
            <div>
              <p className="text-base font-black text-foreground">+23.4%</p>
              <p className="text-[10px]" style={{ color: 'var(--ls-subtle)' }}>
                vs last week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom scroll hint */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-10">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.3em]"
          style={{ color: 'var(--ls-faint)' }}
        >
          Scroll
        </span>
        <div
          className="h-8 w-px"
          style={{ background: 'linear-gradient(to bottom, var(--ls-faint), transparent)' }}
        />
      </div>
    </section>
  );
};
