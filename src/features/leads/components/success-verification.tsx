'use client';

import { Award, CheckCircle2, ChevronRight, Clock, Shield } from 'lucide-react';
// import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface SuccessVerificationProps {
  campaignId?: string | null;
  contactId?: string | null;
}

export const SuccessVerification = ({ campaignId, contactId }: SuccessVerificationProps) => {
  // const router = useRouter();

  const handleProceed = () => {
    toast.info('Under development');
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 opacity-25 blur group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Verification Successful!
          </h2>
          <p className="text-muted-foreground text-lg">
            Your identity has been verified. You can now proceed to complete your information.
          </p>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-3 gap-3 py-4">
        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900">
          <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Secure</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Fast</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900">
          <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Trusted</span>
        </div>
      </div>

      {/* Next Steps */}
      {/* <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Next Steps:</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>Complete your loan application form</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>Review by our team within 24 hours</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>Get instant approval notification</span>
          </li>
        </ul>
      </div> */}

      {/* Time Estimate */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Clock className="h-4 w-4" />
        <span>Takes only 2-3 minutes to complete</span>
      </div>

      <div className="pt-2">
        <Button onClick={handleProceed} className="w-full h-12 text-base font-semibold">
          Continue to Application
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center justify-center">
        <div className="h-1 w-12 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  );
};
