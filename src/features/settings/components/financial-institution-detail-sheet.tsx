'use client';

import { Building2, Clock, Landmark, Mail, Phone, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { FinancialInstitution } from '../types';

interface FinancialInstitutionDetailSheetProps {
  institution: FinancialInstitution | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusStyles = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'inactive':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export function FinancialInstitutionDetailSheet({
  institution,
  isOpen,
  onClose,
}: FinancialInstitutionDetailSheetProps) {
  if (!institution) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md border-l border-slate-200 bg-white p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Landmark className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <SheetTitle className="text-xl font-bold text-slate-900 leading-tight">
                {institution.name}
              </SheetTitle>
              <Badge
                variant="outline"
                className={`rounded-full ${getStatusStyles(institution.status)}`}
              >
                {institution.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="p-6">
          {/* Combined Information Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Basic Information Section */}
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">IFSC Code</span>
                  <span className="text-sm font-mono font-semibold text-slate-900 uppercase">
                    {institution.ifscCode}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-50">
                  <span className="text-sm text-slate-500">Branch</span>
                  <span className="text-sm font-medium text-slate-900 capitalize">
                    {institution.branch || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-start py-2 border-t border-slate-50">
                  <span className="text-sm text-slate-500">Created At</span>
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-1.5 text-right">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formatDate(institution.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                <User className="h-4 w-4" />
                Primary Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg  ">
                  <div className="p-2.5 rounded-full bg-primary text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      Contact Name
                    </span>
                    <p className="text-base text-slate-700 mt-0.5">
                      {institution.contact.name || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 group transition-colors hover:bg-blue-50/50 hover:border-blue-200">
                  <div className="p-2 rounded-md bg-blue-100 border border-blue-200 text-blue-600  transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      Email Address
                    </span>
                    <span className="text-sm text-slate-700 break-all mt-0.5">
                      {institution.contact.email || '-'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 group transition-colors hover:bg-green-50/50 hover:border-green-200">
                  <div className="p-2 rounded-md bg-green-100 border border-green-200 text-green-600   transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      Phone Number
                    </span>
                    <span className="text-sm text-slate-700 mt-0.5">
                      {institution.contact.phone || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
