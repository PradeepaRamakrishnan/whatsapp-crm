import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Fintech Visual */}
      <div
        className="relative hidden lg:flex items-center justify-center p-12 bg-cover bg-center"
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

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center mb-2">
            <div className="relative w-72">
              <Image
                src="/assets/images/samatvalogo.png"
                alt="Samatva Awareness Logo"
                width={288}
                height={80}
                className="object-contain"
              />
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer Links */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Don't have an account?{' '}
              <Link href="#" className="font-medium text-primary hover:underline">
                Contact sales
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
