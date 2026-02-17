'use client';

import { CheckCircle2 } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { useRouter } from 'nextjs-toploader/app';

interface SuccessVerificationProps {
  campaignId?: string | null;
  contactId?: string | null;
}

export const SuccessVerification = ({
  campaignId: _campaignId,
  contactId: _contactId,
}: SuccessVerificationProps) => {
  // const router = useRouter();

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 opacity-25 blur group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Submission Received!
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Thanks for submitting all the required documents as requested by our partner NBFC (
              <a
                href="https://anchorage.cloudbankin.com/onboard/#/home/welcome"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                A1Loans
              </a>
              ), we have shared your contact number and email id.
            </p>
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/50">
              <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                They will be contacting you shortly for further processing of your loan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
