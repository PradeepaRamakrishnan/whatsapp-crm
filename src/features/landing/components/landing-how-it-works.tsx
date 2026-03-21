'use client';

import { useGSAP } from '@gsap/react';
import { Analytics01Icon, FlashIcon, Upload01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP as never);

const STEPS = [
  {
    num: '01',
    icon: Upload01Icon,
    color: '#a78bfa',
    glow: 'rgba(124,58,237,0.25)',
    gradFrom: '#7c3aed',
    gradTo: '#3b82f6',
    title: 'Upload your contacts',
    body: 'Import your full audience in seconds. Paste a CSV, drag-and-drop a spreadsheet, or connect via API. Our smart validation engine catches duplicates, invalid numbers, and formatting issues automatically — so your list is clean before the first send.',
    visual: (
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
      >
        <p
          className="mb-3 font-mono text-[9px] uppercase tracking-widest"
          style={{ color: 'var(--ls-faint)' }}
        >
          contacts_q4.csv — 12,400 rows
        </p>
        <div
          className="mb-3 h-2 overflow-hidden rounded-full"
          style={{ background: 'var(--ls-card-border)' }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: '92%', background: 'linear-gradient(to right, #7c3aed, #22d3ee)' }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#34d399' }}>✓ 11,408 valid</span>
          <span style={{ color: 'var(--ls-subtle)' }}>992 skipped</span>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {[
            'Priya Sharma · +91 98765 43210',
            'Amit Kumar · +91 87654 32109',
            'Sneha Reddy · +91 76543 21098',
          ].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: 'var(--ls-card)' }}
            >
              <span className="text-xs text-foreground/70">{row}</span>
              <span className="text-[10px] font-semibold" style={{ color: '#34d399' }}>
                Valid
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '02',
    icon: FlashIcon,
    color: '#60a5fa',
    glow: 'rgba(59,130,246,0.25)',
    gradFrom: '#3b82f6',
    gradTo: '#22d3ee',
    title: 'Build your campaign',
    body: 'Choose WhatsApp, SMS, or Email. Write your message with dynamic variables like {{name}}, {{amount}} and personalise at scale. Set your send time, configure drip sequences, and add follow-up triggers — all from one clean interface. No coding required.',
    visual: (
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
      >
        <p
          className="mb-3 font-mono text-[9px] uppercase tracking-widest"
          style={{ color: 'var(--ls-faint)' }}
        >
          Message preview
        </p>
        <div
          className="mb-3 rounded-xl rounded-tl-none p-3 text-xs"
          style={{
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.2)',
            color: 'var(--ls-muted)',
            lineHeight: '1.6',
          }}
        >
          Hi <span style={{ color: '#a78bfa', fontWeight: 700 }}>{'{{name}}'}</span>, your
          outstanding amount of{' '}
          <span style={{ color: '#a78bfa', fontWeight: 700 }}>{'{{amount}}'}</span> is due on{' '}
          <span style={{ color: '#a78bfa', fontWeight: 700 }}>{'{{due_date}}'}</span>. Reply YES to
          confirm receipt.
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { ch: 'WhatsApp', c: '#34d399' },
            { ch: 'SMS', c: '#60a5fa' },
            { ch: 'Email', c: '#a78bfa' },
          ].map((item) => (
            <div
              key={item.ch}
              className="rounded-lg py-2 text-center text-[11px] font-semibold"
              style={{ background: `${item.c}12`, color: item.c, border: `1px solid ${item.c}25` }}
            >
              {item.ch}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '03',
    icon: Analytics01Icon,
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.25)',
    gradFrom: '#22d3ee',
    gradTo: '#a78bfa',
    title: 'Track & optimise',
    body: "Watch your campaign come to life in real-time. Monitor delivery rates, open rates, and reply rates as they happen. Our AI-powered insights surface what's working and flag underperforming segments — so you can tweak mid-flight and make every send better than the last.",
    visual: (
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--ls-card)', border: '1px solid var(--ls-card-border)' }}
      >
        <p
          className="mb-3 font-mono text-[9px] uppercase tracking-widest"
          style={{ color: 'var(--ls-faint)' }}
        >
          Live analytics
        </p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { l: 'Delivered', v: '94.2%', c: '#34d399' },
            { l: 'Opened', v: '61.8%', c: '#22d3ee' },
            { l: 'Replied', v: '6.8%', c: '#a78bfa' },
          ].map((m) => (
            <div
              key={m.l}
              className="rounded-lg p-2 text-center"
              style={{ background: 'var(--ls-card)' }}
            >
              <p className="text-sm font-black" style={{ color: m.c }}>
                {m.v}
              </p>
              <p className="text-[9px]" style={{ color: 'var(--ls-subtle)' }}>
                {m.l}
              </p>
            </div>
          ))}
        </div>
        <div className="flex h-14 items-end gap-1">
          {[45, 62, 58, 80, 72, 88, 76, 95, 84, 91].map((h, i) => (
            <div
              key={`bar-${h}`}
              className="flex-1 rounded-t"
              style={{
                height: `${h}%`,
                background:
                  i >= 7 ? 'linear-gradient(to top, #22d3ee, #22d3ee66)' : 'rgba(34,211,238,0.2)',
              }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

export const LandingHowItWorks = () => {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.hiw-heading', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.hiw-heading', start: 'top 88%' },
      });

      gsap.from('.hiw-connector', {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.hiw-steps', start: 'top 75%' },
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8"
      style={{ background: 'var(--ls-bg)' }}
    >
      {/* Subtle bg tint */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="hiw-heading mb-20 text-center">
          <p
            className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.4em]"
            style={{ color: '#7c3aed' }}
          >
            How it works
          </p>
          <h2
            className="font-black tracking-tighter text-foreground"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Launch in{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              three steps
            </span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-lg text-base leading-relaxed"
            style={{ color: 'var(--ls-muted)' }}
          >
            Getting your first campaign live takes less than 10 minutes. No onboarding calls. No
            complex setup. Just results.
          </p>
        </div>

        {/* Steps */}
        <div className="hiw-steps relative flex flex-col gap-6">
          {/* Vertical connector line */}
          <div
            className="hiw-connector pointer-events-none absolute top-16 bottom-16 left-1/2 hidden w-px -translate-x-1/2 lg:block"
            style={{
              background:
                'linear-gradient(to bottom, rgba(124,58,237,0.5), rgba(59,130,246,0.4), rgba(34,211,238,0.5))',
            }}
            aria-hidden="true"
          />

          {STEPS.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={step.num}
                className={`hiw-step-${i} relative grid items-center gap-8 lg:grid-cols-2 lg:gap-16`}
              >
                {/* Text side */}
                <div className={isEven ? 'lg:order-1' : 'lg:order-2'}>
                  {/* Step badge */}
                  <div className="mb-5 flex items-center gap-4">
                    <div
                      className="flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${step.gradFrom}, ${step.gradTo})`,
                        boxShadow: `0 0 24px ${step.glow}`,
                      }}
                    >
                      <HugeiconsIcon icon={step.icon} size={26} color="#fff" />
                    </div>
                    <span
                      className="font-mono text-5xl font-black leading-none tracking-tighter"
                      style={{ color: 'var(--ls-hairline)' }}
                    >
                      {step.num}
                    </span>
                  </div>

                  <h3 className="mb-4 text-2xl font-black tracking-tight text-foreground lg:text-3xl">
                    {step.title}
                  </h3>
                  <p
                    className="mb-6 text-base leading-relaxed"
                    style={{ color: 'var(--ls-muted)' }}
                  >
                    {step.body}
                  </p>

                  <a
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                    style={{ color: step.color }}
                  >
                    Learn more →
                  </a>
                </div>

                {/* Visual side */}
                <div className={`relative ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  {/* Glow behind visual */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl blur-2xl"
                    style={{ background: step.glow, opacity: 0.4 }}
                    aria-hidden="true"
                  />
                  <div className="relative">{step.visual}</div>
                </div>

                {/* Center dot on connector (desktop) */}
                <div
                  className="pointer-events-none absolute top-7 left-1/2 hidden size-4 -translate-x-1/2 rounded-full ring-4 ring-[var(--ls-bg)] lg:block"
                  style={{
                    background: `linear-gradient(135deg, ${step.gradFrom}, ${step.gradTo})`,
                    boxShadow: `0 0 16px ${step.glow}`,
                  }}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
