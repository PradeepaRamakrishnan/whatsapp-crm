'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';
import slugify from 'slugify';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createEmptyList } from '../services';
import { fetchFiles } from '../services/client';
import type { FilesResponse } from '../types/file.types';
import { FilesTable } from './files-table';

// ─── Create List Dialog ────────────────────────────────────────────────────────

function CreateListDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsCreating(true);
    toast.loading('Creating list...', { id: 'create-list' });
    const result = await createEmptyList(trimmed);
    setIsCreating(false);
    if (!result.success) {
      toast.error(result.error, { id: 'create-list' });
      return;
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['files'] }),
      queryClient.invalidateQueries({ queryKey: ['campaign-recipient-files'] }),
    ]);
    await queryClient.refetchQueries({ queryKey: ['files'] });
    toast.success('List created!', { id: 'create-list' });
    setOpen(false);
    setName('');
    router.push(`/recipients/${slugify(result.data.name, { lower: true })}/${result.data.id}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setTimeout(() => inputRef.current?.focus(), 50);
        if (!v) setName('');
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create recipient list</DialogTitle>
          <DialogDescription>
            Give your list a name. You can add contacts after it's created.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="create-list-form" onSubmit={handleCreate}>
            <label htmlFor="list-name-input" className="mb-1.5 block text-sm font-medium">
              List Name
            </label>
            <Input
              id="list-name-input"
              ref={inputRef}
              placeholder="e.g. March 2025 Customers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" form="create-list-form" disabled={!name.trim() || isCreating}>
            {isCreating ? 'Creating...' : 'Create List'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <FileText className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight">No recipient lists yet</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Create a list and then add contacts via CSV upload, WhatsApp import, or manual entry.
        </p>
      </div>
      <CreateListDialog>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Create New List
        </Button>
      </CreateListDialog>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function FilesList() {
  const router = useRouter();
  const {
    data: filesCheck,
    isFetched: filesCheckFetched,
    isError,
    isLoading,
    error,
    refetch,
  } = useQuery<FilesResponse>({
    queryKey: ['files', { page: 1, limit: 10 }],
    queryFn: () => fetchFiles(1, 10),
    retry: 1,
  });

  const isAuthError = isError && (error as Error)?.message === 'Unauthorized';
  const hasNoFiles = filesCheckFetched && !isError && (filesCheck?.meta?.total ?? 0) === 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Recipients List</h1>
            <p className="text-sm text-muted-foreground">Manage the people you send campaigns to</p>
          </div>
        </div>
        <CreateListDialog>
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New List
          </Button>
        </CreateListDialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : isAuthError ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Session expired</h2>
            <p className="mt-1 text-sm text-muted-foreground">Please log in again to continue.</p>
          </div>
          <Button size="sm" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Could not load recipient lists</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The service may be unavailable. Please try again in a moment.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : hasNoFiles ? (
        <EmptyState />
      ) : (
        <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
          <FilesTable />
        </Suspense>
      )}
    </div>
  );
}
