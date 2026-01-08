'use client';

import { ArrowLeft, Calendar, Database, FileText } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { filesData } from '../lib/files-data';
import { FileRecordsTable } from './file-records-table';

interface FileDetailsPageProps {
  fileId: string;
}

export function FileDetailsPage({ fileId }: FileDetailsPageProps) {
  const file = useMemo(() => {
    return filesData.find((f) => f.id === fileId);
  }, [fileId]);

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
          <Link href="/campaigns/files">
            <ArrowLeft className="h-4 w-4" />
            Back to Files
          </Link>
        </Button>
      </div>
    );
  }

  const statusColor =
    file.status === 'valid'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300';

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/campaigns/files">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{file.fileName}</h1>
              <Badge className={statusColor} variant="secondary">
                {file.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  Uploaded{' '}
                  {new Date(file.uploadedDate).toLocaleDateString('en-IN', {
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
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/30">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{file.totalRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Records in {file.fileName}</p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>File Records</CardTitle>
          <CardDescription>All records from {file.fileName}</CardDescription>
        </CardHeader>
        <CardContent>
          <FileRecordsTable fileId={fileId} />
        </CardContent>
      </Card>
    </div>
  );
}
