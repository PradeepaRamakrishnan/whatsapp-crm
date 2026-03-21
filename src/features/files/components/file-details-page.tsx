'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Database,
  FileSpreadsheet,
  FileText,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Suspense, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getAllAccounts, getUniqueConversations } from '@/features/whatsapp/services';
import { cn } from '@/lib/utils';
import { addContactsToFile } from '../services';
import { addContact, fetchFileById } from '../services/client';
import type { FileDetailData } from '../types/file.types';
import { FileActions } from './file-actions';
import { FileRecordsTable } from './file-records-table';

interface FileDetailsPageProps {
  fileId: string;
}

type ManualRow = { id: string; name: string; phone: string; email: string };
type WaContact = { id: string; name: string; phone: string; email?: string };

// ─── Upload Tab ────────────────────────────────────────────────────────────────

function AddUploadTab({ fileId, onSuccess }: { fileId: string; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setFileError('Please select at least one file');
      return;
    }
    setFileError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      for (const f of files) formData.append('files', f);
      toast.loading('Uploading contacts...', { id: 'add-upload' });
      await addContactsToFile(fileId, formData);
      queryClient.invalidateQueries({ queryKey: ['file', fileId] });
      toast.success('Contact added successfully!', { id: 'add-upload' });
      setFiles([]);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload contacts', {
        id: 'add-upload',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-muted/30">
          <h3 className="text-base font-semibold text-foreground">Upload CSV File</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Import contacts from a spreadsheet file
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field data-invalid={!!fileError}>
              <label
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer group block',
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30',
                  fileError ? 'border-destructive/50 bg-destructive/5' : '',
                )}
              >
                <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200',
                      isDragging
                        ? 'bg-primary text-primary-foreground scale-110'
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                    )}
                  >
                    <Upload className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-foreground">
                      {isDragging ? 'Release to upload' : 'Drag & drop your files here'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports CSV, XLS, XLSX · Up to 10 MB per file
                    </p>
                  </div>
                  <label
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'cursor-pointer',
                    )}
                  >
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
                          setFileError('');
                        }
                      }}
                    />
                  </label>
                </div>
              </label>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${file.size}-${idx}`}
                      className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <FileSpreadsheet className="h-4 w-4 text-primary" />
                      </div>
                      <span className="flex-1 truncate text-sm font-medium text-foreground">
                        {file.name}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums shrink-0">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FieldError>{fileError}</FieldError>
            </Field>
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Uploading...
                  </span>
                ) : (
                  'Add New Contacts'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Required columns info */}
      <div className="rounded-xl border border-blue-200/70 bg-blue-50/80 dark:border-blue-900/40 dark:bg-blue-950/20 overflow-hidden self-start">
        <div className="px-5 py-4 border-b border-blue-200/50 dark:border-blue-900/30">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Required Columns</p>
        </div>
        <div className="p-5 space-y-4">
          {[
            { col: 'Customer Name', alt: 'or: Customer', required: true },
            { col: 'Mobile Number', alt: 'or: Mobile No', required: true },
            { col: 'Email ID', alt: 'or: Email', required: false },
          ].map(({ col, alt, required }) => (
            <div key={col} className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-2 h-2 w-2 shrink-0 rounded-full',
                  required ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-600',
                )}
              />
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  {col}
                  {required && <span className="ml-1 text-red-500">*</span>}
                </p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">{alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── WhatsApp Tab ──────────────────────────────────────────────────────────────

function AddWhatsAppTab({ fileId, onSuccess }: { fileId: string; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const {
    data: accountsRaw,
    isLoading: accountsLoading,
    isError: accountsIsError,
  } = useQuery({
    queryKey: ['wa-accounts-for-import'],
    queryFn: () => getAllAccounts(),
    retry: false,
  });
  const accounts = ((accountsRaw as { data?: { phoneNumber: string; status: string }[] })?.data ??
    (accountsRaw as { phoneNumber: string; status: string }[]) ??
    []) as { phoneNumber: string; status: string }[];
  const wabaPhone =
    accounts.find((a) => a.status === 'connected' || a.status === 'active')?.phoneNumber ??
    accounts[0]?.phoneNumber;
  const {
    data: convsRaw,
    isLoading: convsLoading,
    isError: convsIsError,
    error,
  } = useQuery({
    queryKey: ['wa-unique-convs', wabaPhone],
    queryFn: () => getUniqueConversations(wabaPhone ?? ''),
    enabled: !!wabaPhone,
    retry: false,
  });

  const isLoading = accountsLoading || (!!wabaPhone && convsLoading);
  const isError = accountsIsError || convsIsError;
  const isAuthError =
    isError &&
    error instanceof Error &&
    (error.message.includes('auth token') || error.message.includes('401'));
  const allContacts: WaContact[] = ((convsRaw as { contactNumber: string }[]) ?? []).map((c) => ({
    id: c.contactNumber,
    name: c.contactNumber,
    phone: c.contactNumber,
  }));
  const contacts = search ? allContacts.filter((c) => c.phone.includes(search)) : allContacts;

  const { mutate: doImport, isPending } = useMutation({
    mutationFn: async () => {
      const chosen = contacts.filter((c) => selected.has(c.id));
      const csvRows = ['Customer Name,Mobile Number,Email ID'];
      for (const c of chosen) csvRows.push(`${c.name},${c.phone},${c.email ?? ''}`);
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], `wa-import-${Date.now()}.csv`, { type: 'text/csv' });
      const formData = new FormData();
      formData.append('files', csvFile);
      await addContactsToFile(fileId, formData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['file', fileId] });
      toast.success('WhatsApp contacts added!');
      setSelected(new Set());
      onSuccess();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Import failed'),
  });

  const toggleAll = () =>
    setSelected(selected.size === contacts.length ? new Set() : new Set(contacts.map((c) => c.id)));
  const toggleContact = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Import from WhatsApp</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select contacts from your conversations
            </p>
          </div>
          {contacts.length > 0 && (
            <Button variant="outline" size="sm" onClick={toggleAll} className="shrink-0">
              {selected.size === contacts.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
        <div className="px-4 py-3 border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search by phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/30"
            />
          </div>
        </div>
        <div className="max-h-[320px] overflow-y-auto divide-y divide-border/40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading contacts...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/40">
                <MessageCircle className="h-7 w-7 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {isAuthError ? 'Session expired' : 'Could not load contacts'}
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {isAuthError
                    ? 'Please log out and back in, then try again.'
                    : error instanceof Error
                      ? error.message
                      : 'An error occurred.'}
                </p>
              </div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No contacts found</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <label
                key={contact.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30',
                  selected.has(contact.id) ? 'bg-primary/5' : '',
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                    selected.has(contact.id)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                  )}
                >
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{contact.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{contact.phone}</p>
                </div>
                {selected.has(contact.id) && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
              </label>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{selected.size}</span> of{' '}
            <span className="tabular-nums">{contacts.length}</span> selected
          </p>
          <Button
            onClick={() => doImport()}
            disabled={selected.size === 0 || isPending}
            className="min-w-[120px]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Adding...
              </span>
            ) : (
              `Add${selected.size > 0 ? ` (${selected.size})` : ''}`
            )}
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/20 overflow-hidden self-start">
        <div className="px-5 py-4 border-b border-emerald-200/50 dark:border-emerald-900/30">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            How it works
          </p>
        </div>
        <div className="p-5 space-y-4">
          {[
            'Selected contacts are added to this recipient list.',
            'Contacts without a phone number are skipped.',
            'Duplicates will be handled by the backend.',
          ].map((text) => (
            <div key={text} className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Manual Entry Tab ──────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string {
  if (!email.trim()) return '';
  return EMAIL_REGEX.test(email.trim()) ? '' : 'Invalid email address';
}

function AddManualTab({ fileId, onSuccess }: { fileId: string; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<ManualRow[]>([
    { id: crypto.randomUUID(), name: '', phone: '', email: '' },
  ]);
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});

  const addRow = () =>
    setRows((prev) => [...prev, { id: crypto.randomUUID(), name: '', phone: '', email: '' }]);
  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setEmailErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };
  const updateRow = (id: string, key: keyof Omit<ManualRow, 'id'>, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
    if (key === 'email') {
      setEmailErrors((prev) => ({ ...prev, [id]: validateEmail(value) }));
    }
  };
  const hasEmailErrors = Object.values(emailErrors).some(Boolean);
  const validRows = rows.filter((r) => r.name.trim() && r.phone.trim());

  const mutation = useMutation({
    mutationFn: (contacts: ManualRow[]) =>
      Promise.all(
        contacts.map((r) =>
          addContact(fileId, {
            customerName: r.name.trim(),
            mobileNumber: r.phone.trim() || undefined,
            emailId: r.email.trim() || undefined,
          }),
        ),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file', fileId] });
      toast.success('Contacts added!');
      setRows([{ id: crypto.randomUUID(), name: '', phone: '', email: '' }]);
      onSuccess();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add contacts');
    },
  });

  const handleSave = () => {
    if (hasEmailErrors) {
      toast.error('Please fix the invalid email addresses before saving.');
      return;
    }
    mutation.mutate(validRows);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Add Contacts Manually</h3>
          <p className="text-sm text-muted-foreground mt-1">Enter contact details one by one</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Row
        </Button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[40px_1fr_1fr_1fr_44px] items-center gap-3 border-b border-border/40 bg-muted/20 px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
          #
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Full Name <span className="text-destructive">*</span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Phone <span className="text-destructive">*</span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Email
        </span>
        <span />
      </div>

      {/* Rows */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-border/30">
        {rows.map((row, idx) => {
          const isValid = row.name.trim() && row.phone.trim();
          return (
            <div
              key={row.id}
              className={cn(
                'grid grid-cols-[40px_1fr_1fr_1fr_44px] gap-3 px-5 py-3 transition-colors',
                emailErrors[row.id] ? 'items-start pt-3.5' : 'items-center',
                isValid ? 'bg-transparent' : 'bg-muted/10',
              )}
            >
              <span className="text-center text-sm font-medium text-muted-foreground tabular-nums">
                {idx + 1}
              </span>
              <Input
                placeholder="John Smith"
                value={row.name}
                onChange={(e) => updateRow(row.id, 'name', e.target.value)}
              />
              <Input
                placeholder="+91 98765 43210"
                value={row.phone}
                onChange={(e) => updateRow(row.id, 'phone', e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="email@example.com"
                  value={row.email}
                  onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                  className={cn(
                    emailErrors[row.id] ? 'border-destructive focus-visible:ring-destructive' : '',
                  )}
                />
                {emailErrors[row.id] && (
                  <span className="text-xs text-destructive">{emailErrors[row.id]}</span>
                )}
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-colors',
              validRows.length > 0 ? 'bg-emerald-500' : 'bg-muted-foreground/30',
            )}
          />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{validRows.length}</span>{' '}
            of <span className="tabular-nums">{rows.length}</span>{' '}
            {rows.length === 1 ? 'row' : 'rows'} valid
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={validRows.length === 0 || mutation.isPending || hasEmailErrors}
          className="min-w-[140px]"
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Adding...
            </span>
          ) : (
            'Add New Contacts'
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Add Contacts Method Picker ────────────────────────────────────────────────

const ADD_METHODS = [
  {
    view: 'upload' as const,
    icon: Upload,
    label: 'Upload CSV',
    desc: 'Bulk import hundreds of contacts from a spreadsheet in one go',
    badge: 'Recommended',
    badgeColor: 'bg-orange-100/80 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    cardBg: 'bg-orange-50/50 dark:bg-orange-950/10',
    border:
      'border-orange-200/70 hover:border-orange-300/80 dark:border-orange-800/30 dark:hover:border-orange-700/50',
    leftAccent: 'border-l-orange-400/70',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-500 dark:text-orange-400',
    steps: [
      'Select a CSV, XLS, or XLSX file',
      'Columns are mapped automatically',
      'Duplicates handled by the system',
    ],
    stepColor: 'text-orange-500/80 dark:text-orange-400/70',
    ctaColor: 'text-orange-500 group-hover:text-orange-600 dark:text-orange-400',
    supportText: 'Supports CSV · XLS · XLSX · up to 10 MB',
  },
  {
    view: 'whatsapp' as const,
    icon: MessageCircle,
    label: 'WhatsApp',
    desc: 'Pick contacts directly from your active WhatsApp conversations',
    badge: 'Quick',
    badgeColor: 'bg-sky-100/80 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    cardBg: 'bg-sky-50/50 dark:bg-sky-950/10',
    border:
      'border-sky-200/70 hover:border-sky-300/80 dark:border-sky-800/30 dark:hover:border-sky-700/50',
    leftAccent: 'border-l-sky-400/70',
    iconBg: 'bg-sky-100 dark:bg-sky-900/30',
    iconColor: 'text-sky-500 dark:text-sky-400',
    steps: [
      'Browse your WhatsApp conversations',
      'Select one or multiple contacts',
      'Phone numbers imported instantly',
    ],
    stepColor: 'text-sky-500/80 dark:text-sky-400/70',
    ctaColor: 'text-sky-500 group-hover:text-sky-600 dark:text-sky-400',
    supportText: 'Requires active WhatsApp connection',
  },
  {
    view: 'manual' as const,
    icon: Pencil,
    label: 'Manual Entry',
    desc: 'Type in contact details row by row for small targeted lists',
    badge: 'Simple',
    badgeColor: 'bg-emerald-100/80 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    cardBg: 'bg-emerald-50/50 dark:bg-emerald-950/10',
    border:
      'border-emerald-200/70 hover:border-emerald-300/80 dark:border-emerald-800/30 dark:hover:border-emerald-700/50',
    leftAccent: 'border-l-emerald-400/70',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    steps: [
      'Enter name and phone for each row',
      'Email address is optional',
      'Add as many rows as needed',
    ],
    stepColor: 'text-emerald-500/80 dark:text-emerald-400/70',
    ctaColor: 'text-emerald-500 group-hover:text-emerald-600 dark:text-emerald-400',
    supportText: 'Name and phone number required',
  },
] as const;

function AddContactsMethodPicker({
  onSelect,
}: {
  onSelect: (view: 'upload' | 'whatsapp' | 'manual') => void;
}) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Add New Contacts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose an import method to get started
          </p>
        </div>
      </div>

      {/* Method grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {ADD_METHODS.map(
          ({
            view,
            icon: Icon,
            label,
            desc,
            badge,
            badgeColor,
            cardBg,
            border,
            leftAccent,
            iconBg,
            iconColor,
            steps,
            stepColor,
            ctaColor,
            supportText,
          }) => (
            <button
              key={view}
              type="button"
              onClick={() => onSelect(view)}
              className={cn(
                'group relative flex flex-col rounded-xl border border-l-4 text-left overflow-hidden',
                'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                cardBg,
                border,
                leftAccent,
              )}
            >
              <div className="flex flex-col gap-4 p-5">
                {/* Icon + badge */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl shrink-0',
                      iconBg,
                    )}
                  >
                    <Icon className={cn('h-5 w-5', iconColor)} />
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold mt-0.5',
                      badgeColor,
                    )}
                  >
                    {badge}
                  </span>
                </div>

                {/* Title + description */}
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>

                {/* Steps */}
                <div className="space-y-2.5 border-t border-border/30 pt-4">
                  {steps.map((step, i) => (
                    <div key={step} className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          'mt-px text-xs font-bold tabular-nums w-4 shrink-0',
                          stepColor,
                        )}
                      >
                        {i + 1}.
                      </span>
                      <p className={cn('text-xs leading-relaxed', stepColor)}>{step}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-auto">
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">{supportText}</p>
                  <span
                    className={cn(
                      'text-xs font-semibold transition-all duration-150 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5',
                      ctaColor,
                    )}
                  >
                    Select →
                  </span>
                </div>
              </div>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function FileDetailsPage({ fileId }: FileDetailsPageProps) {
  const [addView, setAddView] = useState<'select' | 'upload' | 'whatsapp' | 'manual' | null>(null);
  const [contactsAdded, setContactsAdded] = useState(false);

  const handleAddSuccess = () => {
    setContactsAdded(true);
    setAddView(null);
  };

  const { data: file, isLoading } = useQuery<FileDetailData>({
    queryKey: ['file', fileId, { page: 1, limit: 10 }],
    queryFn: () => fetchFileById(fileId, 1, 10),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-semibold">File not found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This file doesn't exist or has been removed.
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/recipients/list" />}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Recipients
        </Button>
      </div>
    );
  }

  const getStatusConfig = (status: string): { label: string; className: string } => {
    const configs: Record<string, { label: string; className: string }> = {
      reviewed: {
        label: 'Reviewed',
        className:
          'bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-900',
      },
      pending_review: {
        label: 'Pending Review',
        className:
          'bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-900',
      },
      failed: {
        label: 'Failed',
        className:
          'bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-900',
      },
      processing: {
        label: 'Processing',
        className:
          'bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-900',
      },
      uploaded: { label: 'Uploaded', className: 'bg-muted text-muted-foreground border-border' },
      queued: { label: 'Queued', className: 'bg-muted text-muted-foreground border-border' },
      archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-border' },
    };
    return (
      configs[status] ?? {
        label: status,
        className: 'bg-muted text-muted-foreground border-border',
      }
    );
  };

  const statusConfig = getStatusConfig(file.status);
  const totalRecords = file.stats?.totalRecords ?? file.contents.meta.total;
  const validRecords = file.stats ? file.stats.totalRecords - file.stats.totalInvalidRecords : null;
  const invalidRecords = file.stats?.totalInvalidRecords ?? null;

  return (
    <div className="flex flex-1 flex-col gap-5 p-5 min-w-0">
      {/* ── Header — back button + title + badge + actions ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 mt-0.5"
            render={<Link href="/recipients/list" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">{file.name}</h1>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0',
                  statusConfig.className,
                )}
              >
                {statusConfig.label}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(file.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {file.source && (
                <>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5" />
                    {file.source}
                  </span>
                </>
              )}
              {file.stats && (
                <>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {totalRecords.toLocaleString()} total
                  </span>
                  {validRecords !== null && (
                    <>
                      <span className="text-border">·</span>
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {validRecords.toLocaleString()} valid
                      </span>
                    </>
                  )}
                  {invalidRecords !== null && invalidRecords > 0 && (
                    <>
                      <span className="text-border">·</span>
                      <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                        <XCircle className="h-3.5 w-3.5" />
                        {invalidRecords.toLocaleString()} invalid
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => setAddView('select')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Contacts
          </Button>
          <FileActions
            fileId={fileId}
            fileName={file.name}
            currentStatus={file.status}
            variant="buttons"
          />
        </div>
      </div>

      {/* ── Contacts section ── */}
      <div>
        {addView !== null && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAddView(addView === 'select' ? null : 'select')}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                {addView === 'select' ? 'Back to Contacts' : 'Change Method'}
              </button>
              {addView !== 'select' && (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  <span className="text-sm font-semibold text-foreground">
                    {addView === 'upload'
                      ? 'Upload CSV'
                      : addView === 'whatsapp'
                        ? 'Import from WhatsApp'
                        : 'Manual Entry'}
                  </span>
                </>
              )}
            </div>

            {addView === 'select' && <AddContactsMethodPicker onSelect={(v) => setAddView(v)} />}
            {addView === 'upload' && <AddUploadTab fileId={fileId} onSuccess={handleAddSuccess} />}
            {addView === 'whatsapp' && (
              <AddWhatsAppTab fileId={fileId} onSuccess={handleAddSuccess} />
            )}
            {addView === 'manual' && <AddManualTab fileId={fileId} onSuccess={handleAddSuccess} />}
          </div>
        )}

        {addView === null &&
          (totalRecords === 0 && !contactsAdded ? (
            <AddContactsMethodPicker onSelect={(v) => setAddView(v)} />
          ) : (
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-10 text-sm text-muted-foreground">
                  Loading contacts...
                </div>
              }
            >
              <FileRecordsTable fileId={fileId} />
            </Suspense>
          ))}
      </div>
    </div>
  );
}
