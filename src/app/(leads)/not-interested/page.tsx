'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { markContactNotInterested } from '@/features/campaigns/services';

function NotInterestedContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const contactId = searchParams.get('contactId');

  const { isLoading, isSuccess, error } = useQuery({
    queryKey: ['markNotInterested', campaignId, contactId],
    queryFn: () => markContactNotInterested(campaignId as string, contactId as string),
    enabled: !!campaignId && !!contactId,
    retry: 1,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
  });

  const hasInvalidParams = !campaignId || !contactId;
  const status = hasInvalidParams
    ? 'error'
    : isLoading
      ? 'loading'
      : isSuccess
        ? 'success'
        : 'error';
  const errorMessage = hasInvalidParams
    ? 'Invalid link. Missing required parameters.'
    : error instanceof Error
      ? error.message
      : 'Failed to process your request';

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-slate-50/50 to-white dark:from-slate-950/20 dark:via-slate-950/10 dark:to-slate-950 p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-linear-to-br from-slate-200/30 to-slate-300/20 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-1/4 w-96 h-96 bg-linear-to-br from-slate-300/20 to-slate-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
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

          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Processing...
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Please wait while we process your response
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Thank You!
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Your response has been recorded successfully.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  We appreciate your time and will update our records accordingly.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Something Went Wrong
                </h2>
                <p className="text-slate-600 dark:text-slate-400">{errorMessage}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotInterestedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NotInterestedContent />
    </Suspense>
  );
}
