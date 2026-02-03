'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { SteppedDocumentUploader } from '@/features/leads/components/stepped-document-uploader';

export default function UploadPage() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId') || '';
  const campaignId = searchParams.get('campaignId') || undefined;
  const contactId = searchParams.get('contactId') || undefined;

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      <div className="container mx-auto py-16 px-4 max-w-6xl">
        <div className="space-y-12">
          {/* Header Section with refined minimalism */}
          <header className="relative">
            <div className="flex justify-center mb-3">
              {/* <div className=" shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"> */}
              <Image
                src="/assets/images/samatvalogo.png"
                alt="Samatva CRM"
                width={200}
                height={70}
                className="h-20 w-auto object-contain"
              />
              {/* </div> */}
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight ">
                Secure Document Portal
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto  tracking-wide">
                Submit your documents securely with bank-grade encryption.
                <br className="hidden sm:block" />
                Your data privacy is our absolute priority.
              </p>
            </div>
          </header>

          {/* Main Uploader Section */}
          <SteppedDocumentUploader leadId={leadId} campaignId={campaignId} contactId={contactId} />
        </div>
      </div>
    </div>
  );
}
