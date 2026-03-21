'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';
import { LandingCta } from '../components/landing-cta';
import { LandingFeatures } from '../components/landing-features';
import { LandingHero } from '../components/landing-hero';
import { LandingHowItWorks } from '../components/landing-how-it-works';
import { LandingNav } from '../components/landing-nav';
import { LandingStats } from '../components/landing-stats';

gsap.registerPlugin(ScrollTrigger, useGSAP as never);

const SECTIONS = ['hero', 'features', 'stats', 'how-it-works', 'cta'];

export const LandingPage = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('hero');

  /* Track which section is in view for nav highlighting */
  useGSAP(
    () => {
      SECTIONS.forEach((id) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: 'top 55%',
          end: 'bottom 55%',
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="min-h-screen" style={{ background: 'var(--ls-bg)' }}>
      <LandingNav activeSection={activeSection} />
      <LandingHero />
      <LandingFeatures />
      <LandingStats />
      <LandingHowItWorks />
      <LandingCta />
    </div>
  );
};
