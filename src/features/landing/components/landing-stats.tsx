'use client';

import { useGSAP } from '@gsap/react';
import {
  Analytics01Icon,
  FlashIcon,
  Globe02Icon,
  MessageMultiple01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type React from 'react';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP as never);

const CAPABILITIES = [
  {
    icon: MessageMultiple01Icon,
    title: 'Multi-channel',
    body: 'Send campaigns over WhatsApp, SMS, and Email from a single unified inbox — no switching between tools.',
    color: '#a78bfa',
    glow: 'rgba(124,58,237,0.2)',
  },
  {
    icon: FlashIcon,
    title: 'Bulk messaging',
    body: 'Upload thousands of contacts via CSV and send personalised messages to each one in a single click.',
    color: '#60a5fa',
    glow: 'rgba(59,130,246,0.2)',
  },
  {
    icon: Analytics01Icon,
    title: 'Real-time analytics',
    body: 'Track delivery, open, and reply rates as they happen. Know exactly how your campaign is performing.',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.2)',
  },
  {
    icon: Globe02Icon,
    title: 'API-first',
    body: 'Integrate with your existing tools via REST API. Trigger campaigns from CRMs, webhooks, or your own app.',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.2)',
  },
];

export const LandingStats = () => {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.caps-label', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.caps-label', start: 'top 88%' },
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="stats"
      className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8"
      style={{ background: 'var(--ls-bg)' }}
    >
      {/* Top gradient divider */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(124,58,237,0.4), rgba(34,211,238,0.3), transparent)',
        }}
        aria-hidden="true"
      />
      {/* Bottom gradient divider */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(59,130,246,0.3), rgba(124,58,237,0.4), transparent)',
        }}
        aria-hidden="true"
      />
      {/* Radial glow center */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        {/* Section label */}
        <div className="caps-label mb-16 text-center">
          <p
            className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.4em]"
            style={{ color: '#7c3aed' }}
          >
            Platform capabilities
          </p>
          <h2
            className="font-black tracking-tighter text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Everything you need{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              in one place
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base" style={{ color: 'var(--ls-muted)' }}>
            Built for teams that want to move fast. No bloat, no steep learning curve — just the
            tools that matter.
          </p>
        </div>

        {/* Capabilities grid */}
        <div className="caps-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="cap-card group relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
              style={
                {
                  '--cap-hover-border': `${cap.color}30`,
                  border: '1px solid var(--ls-card-border)',
                  backdropFilter: 'blur(12px)',
                } as React.CSSProperties
              }
            >
              {/* Glow on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${cap.glow} 0%, transparent 70%)`,
                }}
                aria-hidden="true"
              />

              {/* Icon */}
              <div
                className="mb-5 flex size-12 items-center justify-center rounded-xl"
                style={{
                  background: `${cap.color}15`,
                  border: `1px solid ${cap.color}25`,
                }}
              >
                <HugeiconsIcon icon={cap.icon} size={22} color={cap.color} />
              </div>

              <h3 className="mb-2 text-base font-bold text-foreground">{cap.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
                {cap.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
