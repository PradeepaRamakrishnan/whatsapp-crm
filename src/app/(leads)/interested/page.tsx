'use client';

import Image from 'next/image';
import { InterestedForm } from '@/features/leads/components/interested_form';

const InterestedPage = () => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Brand Visual (Hidden on mobile) */}
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-orange-50/50 to-white dark:from-orange-950/20 dark:via-orange-950/10 dark:to-slate-950 p-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-orange-300/20 rounded-full blur-3xl" />
          <div className="absolute top-3/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-orange-200/10 rounded-full blur-3xl" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-xl w-full space-y-12">
          {/* Logo Section */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-48 h-20">
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
              <h2 className="text-5xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">
                Instant Loans.
              </h2>
              <h2 className="text-6xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Zero Hassle.
                </span>
              </h2>
            </div>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Get access to quick credit solutions tailored for your financial needs. Secure,
              reliable, and fast.
            </p>
          </div>

          {/* Large Illustration */}
          <div className="flex justify-center lg:justify-start pt-4">
            <div className="relative w-full max-w-sm aspect-square drop-shadow-2xl animate-float">
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
      <div className="flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-xl flex flex-col items-center">
          {/* Mobile-only Logo & Illustration */}
          <div className="lg:hidden w-full flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-8">
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

            <div className="relative w-full h-56">
              <Image
                src="/assets/images/finance.png"
                alt="Loan illustration"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>

          <InterestedForm />
        </div>
      </div>
    </div>
  );
};

export default InterestedPage;
