'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { ThemeModeToggle } from '@/components/shared/theme-toggle';
import { siteConfig } from '@/config/site';
import { LoginForm } from '../components/login-form';

gsap.registerPlugin(useGSAP as never);

export const LoginPage = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Orb drift ── */
  useGSAP(
    () => {
      gsap.to('.orb-a', { x: 60, y: 80, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.orb-b', {
        x: -50,
        y: -60,
        duration: 14,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 3,
      });
      gsap.to('.orb-c', {
        x: 30,
        y: -40,
        duration: 9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 6,
      });
    },
    { scope: rootRef },
  );

  /* ── Hero entrance ── */
  useGSAP(
    () => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-label', { opacity: 0, y: -12, duration: 0.5 })
        .from('.hero-line1', { opacity: 0, y: 90, skewY: 3, duration: 0.8 }, '-=0.2')
        .from('.hero-line2', { opacity: 0, y: 90, skewY: 3, duration: 0.8 }, '-=0.6')
        .from('.hero-divider', { scaleX: 0, duration: 0.6, transformOrigin: 'left' }, '-=0.3')
        .from('.hero-tagline', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
        .from('.stat-card', { opacity: 0, y: 30, stagger: 0.08, duration: 0.45 }, '-=0.2');
    },
    { scope: heroRef },
  );

  /* ── Panel entrance ── */
  useGSAP(
    () => {
      gsap.from('.panel-inner', {
        opacity: 0,
        y: 32,
        duration: 0.75,
        ease: 'power3.out',
        delay: 0.4,
      });
    },
    { scope: panelRef },
  );

  return (
    <div
      ref={rootRef}
      className="relative grid min-h-screen overflow-hidden bg-background lg:grid-cols-[3fr_2fr]"
    >
      {/* ══ Atmospheric background ══ */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Noise film grain */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />

        {/* Orbs */}
        <div
          className="orb-a absolute -top-56 -left-56 size-[750px] rounded-full blur-[130px]"
          style={{ background: 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
        />
        <div
          className="orb-b absolute -right-40 -bottom-40 size-[650px] rounded-full blur-[150px]"
          style={{ background: 'color-mix(in oklch, var(--foreground) 6%, transparent)' }}
        />
        <div
          className="orb-c absolute top-1/2 left-1/3 size-[350px] -translate-y-1/2 rounded-full blur-[80px]"
          style={{ background: 'color-mix(in oklch, var(--foreground) 4%, transparent)' }}
        />

        {/* Vignette — darkens edges slightly */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, color-mix(in oklch, var(--background) 60%, transparent) 100%)',
          }}
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeModeToggle />
      </div>

      {/* ══ Left 60% — Hero ══ */}
      <div ref={heroRef} className="relative hidden flex-col justify-between px-16 py-14 lg:flex">
        {/* Label */}
        <p className="hero-label font-mono text-[10px] tracking-[0.4em] text-muted-foreground/50 uppercase">
          {siteConfig.brand.line1}&nbsp;&nbsp;·&nbsp;&nbsp;{siteConfig.subtitle}
        </p>

        {/* Title block */}
        <div className="-mt-4">
          <div className="overflow-hidden">
            <h1 className="hero-line1 bg-gradient-to-b from-foreground to-foreground/55 bg-clip-text text-[6.5rem] leading-[0.9] font-black tracking-tighter text-transparent xl:text-[8.5rem]">
              {siteConfig.brand.line1}
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="hero-line2 bg-gradient-to-b from-foreground to-foreground/55 bg-clip-text text-[6.5rem] leading-[0.9] font-black tracking-tighter text-transparent xl:text-[8.5rem]">
              {siteConfig.brand.line2}
            </h1>
          </div>

          {/* Accent divider */}
          <div className="hero-divider mt-8 mb-6 h-px w-16 bg-primary" />

          <p className="hero-tagline max-w-xs text-[0.95rem] leading-relaxed text-muted-foreground">
            {siteConfig.tagline}
          </p>
        </div>

        {/* Stats */}
        <div className="grid max-w-md grid-cols-2 gap-2.5">
          {siteConfig.stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card group rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card/80"
            >
              <p className="mb-1.5 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/60 uppercase">
                {stat.label}
              </p>
              <p className="text-[1.6rem] font-bold leading-none tracking-tight text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="absolute right-8 bottom-6 font-mono text-[9px] text-muted-foreground/30 uppercase tracking-widest">
          {siteConfig.copyright} {siteConfig.name}
        </p>
      </div>

      {/* ══ Right 40% — Form Panel ══ */}
      <div
        ref={panelRef}
        className="relative flex min-h-screen items-center justify-center px-10 py-16 lg:border-l lg:border-border/40"
      >
        <div className="panel-inner w-full max-w-md">
          {/* Mobile brand label */}
          <p className="mb-8 text-center font-mono text-[10px] tracking-widest text-muted-foreground/50 uppercase lg:hidden">
            {siteConfig.name}
          </p>

          {/* Glow behind card */}
          <div
            className="absolute inset-x-8 top-1/2 h-40 -translate-y-1/2 rounded-full blur-[60px]"
            style={{ background: 'color-mix(in oklch, var(--foreground) 6%, transparent)' }}
          />

          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/70 px-10 py-10 shadow-2xl backdrop-blur-xl">
            {/* Subtle inner top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Sign in to {siteConfig.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Welcome back! Please sign in to continue
              </p>
            </div>

            <LoginForm />

            <p className="mt-6 text-center text-xs text-muted-foreground/50">
              Don&apos;t have an account?{' '}
              <button type="button" className="text-primary transition-opacity hover:opacity-80">
                Contact sales
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
