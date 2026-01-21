'use client';

import Image from 'next/image';
import { InterestedForm } from '@/features/leads/components/interested-form';

const InterestedPage = () => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Brand Visual (Hidden on mobile) */}
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-orange-50/50 to-white dark:from-orange-950/20 dark:via-orange-950/10 dark:to-slate-950 p-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-orange-300/20 rounded-full blur-3xl" />
          <div className="absolute top-3/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-orange-200/10 rounded-full blur-3xl" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-xl w-full space-y-12">
          {/* Logo Section */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-40 h-16">
              <Image
                src="/assets/images/samatvalogo.png"
                alt="Samatva CRM Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">
                Rebuild Credit,
                <br />
                Regain Credibility
              </h2>
            </div>

            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Expert credit counseling to help you improve your credit score and access better
              financial opportunities. Professional guidance from former banking experts.
            </p>
          </div>

          {/* Large Illustration */}
          <div className="flex justify-center lg:justify-start pt-4">
            <div className="relative w-full max-w-[280px] aspect-square drop-shadow-2xl">
              <Image
                src="/assets/images/finance.png"
                alt="Loan application"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Right Side - Form Container */}
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl flex flex-col items-center">
          {/* Mobile-only Logo & Illustration */}
          <div className="lg:hidden w-full flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-48 h-24 ">
                <Image
                  src="/assets/images/samatvalogo.png"
                  alt="A1 Loans"
                  fill
                  className="object-contain"
                />
              </div>
              {/* <div className="flex flex-col">
                <h1 className="text-xl font-bold leading-tight">A1 Loans</h1>
                <p className="text-sm font-semibold leading-tight">Anchorage Finkred</p>
                <p className="text-xs text-gray-500 italic">RBI approved NBFC</p>
              </div> */}
            </div>

            {/* <div className="relative w-full h-56">
              <Image
                src="/assets/images/finance.png"
                alt="Loan illustration"
                fill
                priority
                className="object-contain"
              />
            </div> */}
          </div>

          <InterestedForm />
        </div>
      </div>
    </div>
  );
};

export default InterestedPage;
