'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Calendar, Database, FileText, Mail, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFileById } from '../services';
import type { FileDetailData } from '../types/file.types';
import { FileActions } from './file-actions';
import { FileRecordsTable } from './file-records-table';

interface FileDetailsPageProps {
  fileId: string;
}

export function FileDetailsPage({ fileId }: FileDetailsPageProps) {
  const { data: file, isLoading } = useQuery<FileDetailData>({
    queryKey: ['file', fileId, { page: 1, limit: 10 }],
    queryFn: () => getFileById(fileId, 1, 10),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-sm text-muted-foreground">Fetching file details</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">File not found</h2>
          <p className="text-sm text-muted-foreground">
            The file you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/files/list">
            <ArrowLeft className="h-4 w-4" />
            Back to Files
          </Link>
        </Button>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'pending_review':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
      case 'failed':
        return 'text-white';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      uploaded: 'Uploaded',
      queued: 'Queued',
      processing: 'Processing',
      pending_review: 'Pending Review',
      reviewed: 'Reviewed',
      archived: 'Archived',
      failed: 'Failed',
    };
    return labels[status] || status;
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{file.name}</h1>
              <Badge className={getStatusBadgeClass(file.status)} variant="secondary">
                {getStatusLabel(file.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  Uploaded{' '}
                  {new Date(file.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="h-4 w-4" />
                <span>{file.bankName}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <FileActions
            fileId={fileId}
            fileName={file.name}
            currentStatus={file.status}
            variant="buttons"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/30">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {file.stats?.totalRecords.toLocaleString() ??
                file.contents.meta.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Records in {file.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invalid Records</CardTitle>
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {file.stats?.totalInvalidRecords.toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Records with errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950/30">
              <Mail className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {file.stats?.duplicateEmailInCampaign.toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Found in campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excluded</CardTitle>
            <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-950/30">
              <XCircle className="h-4 w-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {file.stats?.excludedCount.toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Excluded records</p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
        <FileRecordsTable fileId={fileId} />
      </Suspense>
    </div>
  );
}
