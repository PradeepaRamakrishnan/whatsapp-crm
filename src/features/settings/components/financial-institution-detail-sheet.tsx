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
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    case 'inactive':
      return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
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
      <SheetContent className="flex flex-col px-4 pt-2 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Landmark className="h-5 w-5 text-primary" />
            </div>
            <span>{institution.name}</span>
          </SheetTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`font-medium ${getStatusStyles(institution.status)}`}
            >
              {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground">Financial Institution Details</span>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto pb-4">
          <div className="grid gap-4">
            <h3 className="text-sm font-semibold mt-2">Basic Information</h3>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/30">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">IFSC Code</p>
                <p className="text-sm font-semibold uppercase">{institution.ifscCode}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 dark:bg-slate-950/30">
                <Landmark className="h-4 w-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Branch</p>
                <p className="text-sm font-medium capitalize">{institution.branch || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-950/30">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Created At</p>
                <p className="text-sm font-medium">{formatDate(institution.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-sm font-semibold">Primary Contact</h3>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Contact Name</p>
                <p className="text-sm font-medium">{institution.contact.name || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/30">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                <p className="truncate text-sm font-medium">{institution.contact.email || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-green-50 dark:bg-green-950/30">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Phone Number</p>
                <p className="text-sm font-medium">{institution.contact.phone || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
