'use client';

import Image from 'next/image';
import { InterestedDetailsForm } from '@/features/leads/components/interested-details-form';

const InterestedFormPage = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <nav className="p-4 md:p-6 flex justify-center bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="relative w-40 h-16">
          <Image
            src="/assets/images/samatvalogo.png"
            alt="Samatva CRM Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </nav>

      {/* Main Form Section */}
      <main className="flex-1 py-12 px-4 md:px-8">
        <InterestedDetailsForm />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-xs text-muted-foreground border-t bg-white dark:bg-slate-900">
        <p>© 2026 Samatva CRM. Anchorage Finkred. RBI Approved NBFC.</p>
        <div className="flex justify-center gap-4 mt-2">
          <div className="hover:text-orange-600 transition-colors">Privacy Policy</div>
          <div className="hover:text-orange-600 transition-colors">Terms of Service</div>
        </div>
      </footer>
    </div>
  );
};

export default InterestedFormPage;
