'use client';

import { Award, CheckCircle2, Clock, Shield } from 'lucide-react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

interface SuccessVerificationProps {
  campaignId?: string | null;
  contactId?: string | null;
}

export const SuccessVerification = ({ campaignId, contactId }: SuccessVerificationProps) => {
  const router = useRouter();

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
                href="https://a1loans.cloudbankin.com"
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

      {/* Information Cards */}
      <div className="grid grid-cols-3 gap-3 py-2">
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Secure
          </span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Fast
          </span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Trusted
          </span>
        </div>
      </div>

      <div className="pt-4">
        <Button
          variant="outline"
          onClick={() => router.push('/leads/interested')}
          className="w-full h-12 text-base font-semibold border-2"
        >
          Return to Home
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Shield className="h-3 w-3" />
          Powered by Samatva Secure
        </div>
      </div>
    </div>
  );
};
