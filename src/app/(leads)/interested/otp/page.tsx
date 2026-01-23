import { Suspense } from 'react';
import { OtpVerificationForm } from '@/features/leads/components/otp-verification-form';

// import Image from 'next/image';

const OtpVerificationPage = () => {
  return (
    <div className="grid h-screen lg:grid-cols-2 overflow-hidden">
      {/* Left Side - Brand Visual (Hidden on mobile) */}
      <div
        className="relative hidden h-full items-center justify-center bg-cover bg-center p-12 lg:flex flex-shrink-0"
        style={{
          backgroundImage: 'url(/assets/images/login-bg.jpg)',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative z-10 max-w-md space-y-8 text-white">
          {/* Tagline */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Rebuild Credit,
              <br />
              Regain Credibility
            </h2>
            <p className="text-lg text-zinc-300">
              Restoring Dignity, Rebuilding Trust, Reimagining Life
            </p>
            <div className="inline-block rounded-full bg-linear-to-r from-orange-500 to-orange-600 px-6 py-3 shadow-lg shadow-orange-500/50">
              <p className="text-xl font-bold text-white">@ Zero Cost</p>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
                <svg
                  className="h-4 w-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Credit Restoration Programs</h3>
                <p className="text-sm text-zinc-400">
                  Comprehensive solutions to rebuild your credit score
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
                <svg
                  className="h-4 w-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Expert Financial Guidance</h3>
                <p className="text-sm text-zinc-400">
                  Professional support to help you regain credibility
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
                <svg
                  className="h-4 w-4 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Transparent Process</h3>
                <p className="text-sm text-zinc-400">
                  Track your progress with complete transparency
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side - Form Container */}
      <div className="flex h-full flex-col items-center overflow-y-auto px-4 py-12 lg:px-8">
        <div className="w-full max-w-xl flex flex-col items-center my-auto">
          <Suspense
            fallback={
              <div className="w-full max-w-md animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
              </div>
            }
          >
            <OtpVerificationForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
