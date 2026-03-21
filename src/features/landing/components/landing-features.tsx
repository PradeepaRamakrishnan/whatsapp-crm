'use client';

import { useGSAP } from '@gsap/react';
import {
  Analytics01Icon,
  FlashIcon,
  Globe02Icon,
  Message01Icon,
  Upload01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP as never);

const AUTOMATION_STEPS = [
  { label: 'Contact imported', done: true },
  { label: 'Template sent', done: true },
  { label: 'Reply detected', done: true },
  { label: 'Follow-up queued', done: false },
];

export const LandingFeatures = () => {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.feat-heading', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.feat-heading',
          start: 'top 88%',
        },
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="features"
      className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8"
      style={{ background: 'var(--ls-bg)' }}
    >
      {/* Subtle section tint */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
        style={{ background: 'rgba(0,0,0,0.03)' }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="feat-heading mb-16 text-center">
          <p
            className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.4em]"
            style={{ color: 'var(--ls-subtle)' }}
          >
            Features
          </p>
          <h2
            className="font-black leading-[1.08] tracking-tighter text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Everything in <span className="text-foreground/60">one place</span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl text-base leading-relaxed"
            style={{ color: 'var(--ls-muted)' }}
          >
            From bulk upload to real-time analytics — every tool your team needs to run campaigns
            that actually convert.
          </p>
        </div>

        {/* Bento grid */}
        <div className="feat-bento grid gap-4 lg:grid-cols-3">
          {/* Card 1: Multi-channel Messaging */}
          <div
            className="feat-card group relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
            style={{ border: '1px solid var(--ls-card-border)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-[60px]"
              style={{ background: 'rgba(0,0,0,0.03)' }}
              aria-hidden="true"
            />
            <div
              className="mb-5 inline-flex size-12 items-center justify-center rounded-xl"
              style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
            >
              <HugeiconsIcon icon={Message01Icon} size={22} color="currentColor" />
            </div>
            <h3 className="mb-2.5 text-lg font-bold text-foreground">Multi-channel Messaging</h3>
            <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
              WhatsApp, SMS, Email — reach your audience on every channel from one unified
              dashboard. No switching tools.
            </p>
            <div className="flex flex-wrap gap-2">
              {['WhatsApp', 'SMS', 'Email'].map((ch) => (
                <span
                  key={ch}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    background: 'var(--ls-card)',
                    color: 'var(--ls-muted)',
                    border: '1px solid var(--ls-card-border)',
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Real-time Analytics */}
          <div
            className="feat-card group relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
            style={{ border: '1px solid var(--ls-card-border)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="pointer-events-none absolute -top-12 -left-12 size-40 rounded-full blur-[60px]"
              style={{ background: 'rgba(0,0,0,0.03)' }}
              aria-hidden="true"
            />
            <div
              className="mb-5 inline-flex size-12 items-center justify-center rounded-xl"
              style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
            >
              <HugeiconsIcon icon={Analytics01Icon} size={22} color="currentColor" />
            </div>
            <h3 className="mb-2.5 text-lg font-bold text-foreground">Real-time Analytics</h3>
            <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
              Live delivery rates, open rates and response tracking. Know exactly how every campaign
              performs, the moment it happens.
            </p>
            {/* Sparkline */}
            <div className="flex h-10 items-end gap-1">
              {[30, 55, 40, 70, 60, 85, 72, 90, 78, 95].map((h, i) => (
                <div
                  key={`spark-${h}`}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: i >= 7 ? 'var(--foreground)' : 'var(--ls-card-border)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Card 3: Lead Management (spans 2 rows) */}
          <div
            className="feat-card group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 lg:row-span-2"
            style={{ border: '1px solid var(--ls-card-border)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="pointer-events-none absolute -bottom-16 -right-16 size-56 rounded-full blur-[80px]"
              style={{ background: 'rgba(0,0,0,0.03)' }}
              aria-hidden="true"
            />
            <div
              className="mb-5 inline-flex size-12 items-center justify-center rounded-xl"
              style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
            >
              <HugeiconsIcon icon={UserGroupIcon} size={22} color="currentColor" />
            </div>
            <h3 className="mb-2.5 text-lg font-bold text-foreground">Lead Management</h3>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
              Capture, qualify and nurture leads with a built-in pipeline tied to every campaign.
              Never lose a prospect.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Priya S.', stage: 'Qualified', color: '#34d399' },
                { name: 'Amit K.', stage: 'In Progress', color: 'var(--ls-muted)' },
                { name: 'Sneha R.', stage: 'New', color: 'var(--ls-muted)' },
                { name: 'Rohan M.', stage: 'Converted', color: '#34d399' },
              ].map((lead) => (
                <div
                  key={lead.name}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--ls-card)',
                    border: '1px solid var(--ls-card-border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-7 items-center justify-center rounded-full text-[11px] font-bold text-foreground"
                      style={{ background: 'var(--ls-card-border)' }}
                    >
                      {lead.name[0]}
                    </div>
                    <span className="text-xs font-medium text-foreground">{lead.name}</span>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: 'var(--ls-card)',
                      border: '1px solid var(--ls-card-border)',
                      color: lead.color,
                    }}
                  >
                    {lead.stage}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-6 grid grid-cols-2 gap-3 rounded-xl p-4"
              style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-hairline)' }}
            >
              <div className="text-center">
                <p className="text-xl font-black text-foreground">8,942</p>
                <p className="text-[10px]" style={{ color: 'var(--ls-subtle)' }}>
                  Total leads
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: '#34d399' }}>
                  72%
                </p>
                <p className="text-[10px]" style={{ color: 'var(--ls-subtle)' }}>
                  Conversion
                </p>
              </div>
            </div>
          </div>

          {/* Smart Automation (col-span-2) */}
          <div
            className="feat-card group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 lg:col-span-2"
            style={{ border: '1px solid var(--ls-card-border)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="pointer-events-none absolute top-0 right-0 size-64 rounded-full blur-[100px]"
              style={{ background: 'rgba(0,0,0,0.02)' }}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
              <div className="flex-1">
                <div
                  className="mb-5 inline-flex size-12 items-center justify-center rounded-xl"
                  style={{
                    background: 'var(--ls-card)',
                    border: '1px solid var(--ls-card-border)',
                  }}
                >
                  <HugeiconsIcon icon={FlashIcon} size={22} color="currentColor" />
                </div>
                <h3 className="mb-2.5 text-lg font-bold text-foreground">Smart Automation</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
                  Set triggers, drip sequences and follow-ups. Your campaigns run while you sleep —
                  automatically reacting to every interaction.
                </p>
              </div>
              <div
                className="flex-1 rounded-xl p-4"
                style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
              >
                <p
                  className="mb-4 font-mono text-[9px] uppercase tracking-widest"
                  style={{ color: 'var(--ls-faint)' }}
                >
                  Automation flow
                </p>
                <div className="relative flex flex-col gap-4">
                  <div
                    className="absolute top-3 bottom-3 left-[11px] w-px"
                    style={{ background: 'var(--ls-card-border)' }}
                    aria-hidden="true"
                  />
                  {AUTOMATION_STEPS.map((step) => (
                    <div key={step.label} className="relative flex items-center gap-3">
                      <div
                        className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{
                          background: step.done ? 'var(--foreground)' : 'var(--ls-hairline)',
                          border: step.done
                            ? '1px solid var(--foreground)'
                            : '1px solid var(--ls-card-border)',
                          color: step.done ? 'var(--background)' : 'var(--ls-faint)',
                        }}
                      >
                        {step.done ? '✓' : '·'}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: step.done ? 'var(--foreground)' : 'var(--ls-subtle)' }}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Upload */}
          <div
            className="feat-card group relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
            style={{ border: '1px solid var(--ls-card-border)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="mb-5 inline-flex size-12 items-center justify-center rounded-xl"
              style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
            >
              <HugeiconsIcon icon={Upload01Icon} size={22} color="currentColor" />
            </div>
            <h3 className="mb-2.5 text-lg font-bold text-foreground">Bulk Upload</h3>
            <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
              Import thousands of contacts via CSV or API. Smart deduplication keeps your list clean
              automatically.
            </p>
            <div
              className="rounded-xl p-3"
              style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
            >
              <div className="mb-2 flex justify-between text-[11px]">
                <span className="text-foreground">contacts_q4.csv</span>
                <span style={{ color: 'var(--ls-subtle)' }}>12,400 rows</span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: 'var(--ls-card-border)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: '85%', background: 'var(--foreground)' }}
                />
              </div>
              <p className="mt-1.5 text-right text-[10px]" style={{ color: 'var(--ls-subtle)' }}>
                10,540 imported · 0 errors
              </p>
            </div>
          </div>

          {/* Global Reach */}
          <div
            className="feat-card group relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
            style={{ border: '1px solid var(--ls-card-border)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="mb-5 inline-flex size-12 items-center justify-center rounded-xl"
              style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
            >
              <HugeiconsIcon icon={Globe02Icon} size={22} color="currentColor" />
            </div>
            <h3 className="mb-2.5 text-lg font-bold text-foreground">Global Reach</h3>
            <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
              Send messages to 190+ countries with local number support and compliance built in from
              day one.
            </p>
            <div className="flex flex-wrap gap-2">
              {['🇮🇳 India', '🇺🇸 USA', '🇬🇧 UK', '🇦🇪 UAE', '+186'].map((c) => (
                <span
                  key={c}
                  className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                  style={{
                    background: 'var(--ls-card)',
                    color: 'var(--ls-muted)',
                    border: '1px solid var(--ls-card-border)',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
