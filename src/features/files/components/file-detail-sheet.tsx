'use client';

import { AlertCircle, ArrowRight, Calendar, Clock, FileText, Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { FileData, FileStatus } from '../types/file.types';

interface FileDetailSheetProps {
  file: FileData | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusStyles = (status: FileStatus): string => {
  switch (status) {
    case 'uploaded':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'queued':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'processing':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'pending_review':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'reviewed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'archived':
      return 'bg-zinc-50 text-zinc-600 border-zinc-200';
    case 'failed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
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

export function FileDetailSheet({ file, isOpen, onClose }: FileDetailSheetProps) {
  const router = useRouter();
  if (!file) return null;

  const handleViewRecords = () => {
    onClose();
    router.push(`/files/${slugify(file.name, { lower: true })}/${file.id}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span>{file.name}</span>
          </SheetTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`font-medium ${getStatusStyles(file.status)}`}>
              {file.status.replace('_', ' ').charAt(0).toUpperCase() +
                file.status.replace('_', ' ').slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground">File Information</span>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-1 pb-4">
          <div className="grid gap-4">
            <h3 className="text-sm font-semibold mt-2">File Details</h3>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/30">
                <Landmark className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Bank Name</p>
                <p className="text-sm font-semibold capitalize">{file.bankName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-950/30">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Uploaded At</p>
                <p className="text-sm font-medium">{formatDate(file.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 dark:bg-slate-950/30">
                <Clock className="h-4 w-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatDate(file.updatedAt)}</p>
              </div>
            </div>
          </div>

          {file.errorDetails && (
            <div className="grid gap-4">
              <h3 className="text-sm font-semibold">Error Information</h3>
              <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/20">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                    {file.errorDetails.message}
                  </p>
                  {file.errorDetails.missingColumns &&
                    file.errorDetails.missingColumns.length > 0 && (
                      <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                        Missing columns: {file.errorDetails.missingColumns.join(', ')}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4">
            <Button className="w-full" onClick={handleViewRecords}>
              View File Records
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
