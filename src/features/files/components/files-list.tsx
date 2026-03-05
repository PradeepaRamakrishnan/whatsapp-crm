'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  FileText,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Suspense, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllAccounts, getUniqueConversations } from '@/features/whatsapp/services';
import { cn } from '@/lib/utils';
import { fileUploadSchema } from '../lib/validation';
import { createFile, getAllFiles } from '../services';
import type { FilesResponse } from '../types/file.types';
import { FilesTable } from './files-table';

// ─── Types ────────────────────────────────────────────────────────────────────

type ManualRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

type WaContact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const ADD_OPTIONS = [
  {
    key: 'upload',
    icon: Upload,
    step: 'Step 1',
    title: 'Upload Files',
    desc: 'Import hundreds of contacts instantly from a CSV or Excel spreadsheet.',
    detail:
      'Perfect if you already have a contact list exported from your bank, CRM, or spreadsheet tool. Just map the columns and you are ready.',
    steps: [
      { label: 'Choose your CSV or Excel file', note: '.csv, .xls, .xlsx supported' },
      { label: 'Give the list a name', note: 'e.g. March 2025 Customers' },
      { label: 'Contacts are parsed & saved', note: 'Ready to use in any campaign' },
    ],
    action: 'Upload CSV',
    tab: 'upload',
    cardBg:
      'bg-amber-50/70 border-amber-200/60 hover:border-amber-300/80 dark:bg-amber-950/20 dark:border-amber-900/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    stepBadge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    stepDot: 'bg-amber-200 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    btnClass:
      'border border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40',
  },
  {
    key: 'whatsapp',
    icon: MessageCircle,
    step: 'Step 2',
    title: 'Import from WhatsApp',
    desc: 'Pull contacts directly from your connected WhatsApp Business account.',
    detail:
      'No file needed. Browse your existing WhatsApp contacts, tick the ones you want, and import them as a recipient list in seconds.',
    steps: [
      { label: 'Search or scroll your WA contacts', note: 'Filter by name or phone' },
      { label: 'Select one or all contacts', note: 'Bulk select available' },
      { label: 'Click Import — list is saved', note: 'Appears here instantly' },
    ],
    action: 'Import Contacts',
    tab: 'whatsapp',
    cardBg:
      'bg-sky-50/70 border-sky-200/60 hover:border-sky-300/80 dark:bg-sky-950/20 dark:border-sky-900/40',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconColor: 'text-sky-600 dark:text-sky-400',
    stepBadge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    stepDot: 'bg-sky-200 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    btnClass:
      'border border-sky-300 text-sky-800 hover:bg-sky-100 dark:border-sky-700 dark:text-sky-300 dark:hover:bg-sky-900/40',
  },
  {
    key: 'manual',
    icon: Pencil,
    step: 'Step 3',
    title: 'Enter Manually',
    desc: 'Type in each recipient yourself — ideal for small, curated contact lists.',
    detail:
      "Add each person's name, phone number, and email one row at a time. Great for a handful of VIP contacts or when you don't have a file ready.",
    steps: [
      { label: 'Give your list a name', note: 'e.g. VIP Clients – Q1' },
      { label: 'Fill in name, phone & email', note: 'Phone is required per row' },
      { label: 'Save — list appears here', note: 'Add more rows any time' },
    ],
    action: 'Start Entering',
    tab: 'manual',
    cardBg:
      'bg-emerald-50/70 border-emerald-200/60 hover:border-emerald-300/80 dark:bg-emerald-950/20 dark:border-emerald-900/40',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    stepBadge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    stepDot: 'bg-emerald-200 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    btnClass:
      'border border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/40',
  },
] as const;

function EmptyState({ onSwitchTab }: { onSwitchTab: (tab: string) => void }) {
  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* ── Hero ── */}
      <div className="rounded-2xl border border-border bg-muted/30 px-8 py-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <FileSpreadsheet className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">
          Welcome! Let's add your first recipients
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground leading-relaxed">
          <strong className="font-semibold text-foreground">Recipients</strong> are the people you
          send campaigns to — your leads, customers, or prospects. You need at least one recipient
          list before you can launch a campaign.
        </p>

        {/* What is a recipient list */}
        <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-border bg-background px-5 py-4 text-left">
          <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            What is a recipient list?
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: '👤', text: 'A group of contacts with name, phone & email' },
              { icon: '🏦', text: 'Tagged to a bank or institution for easy sorting' },
              { icon: '♻️', text: 'Reusable across multiple campaigns' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-2">
                <span className="mt-0.5 text-sm leading-none">{icon}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Method cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {ADD_OPTIONS.map(
          ({
            key,
            icon: Icon,
            step,
            title,
            desc,
            detail,
            steps,
            action,
            tab,
            cardBg,
            iconBg,
            iconColor,
            stepBadge,
            stepDot,
            btnClass,
          }) => (
            <button
              key={key}
              type="button"
              className={`flex flex-col gap-4 rounded-2xl border p-5 text-left transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 ${cardBg}`}
              onClick={() => onSwitchTab(tab)}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${stepBadge}`}
                  >
                    {step}
                  </span>
                  <p className="mt-1 text-sm font-bold text-foreground leading-tight">{title}</p>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-foreground/80 leading-snug">{desc}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{detail}</p>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-2">
                {steps.map((s, i) => (
                  <div key={s.label} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${stepDot}`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[11.5px] font-medium text-foreground/90 leading-snug">
                        {s.label}
                      </p>
                      <p className="text-[10.5px] text-muted-foreground">{s.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <span
                className={`mt-auto w-full rounded-lg px-4 py-2 text-center text-xs font-semibold transition-colors ${btnClass}`}
              >
                {action} →
              </span>
            </button>
          ),
        )}
      </div>

      {/* ── Tips ── */}
      <div className="rounded-xl border border-border bg-muted/20 px-5 py-4">
        <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Tips before you start
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: '📄',
              tip: 'For CSV uploads, ensure the first row has headers like "Customer Name", "Mobile Number", and "Email ID".',
            },
            {
              icon: '📱',
              tip: 'For WhatsApp imports, connect your WhatsApp Business account first under Settings.',
            },
            {
              icon: '🔁',
              tip: 'Recipient lists are reusable — upload once and select the same list across multiple campaigns.',
            },
          ].map(({ icon, tip }) => (
            <div key={tip} className="flex items-start gap-2">
              <span className="mt-0.5 text-sm leading-none">{icon}</span>
              <p className="text-[11.5px] text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Upload CSV Tab ────────────────────────────────────────────────────────────

function UploadTab({ onSuccess }: { onSuccess: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

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
    const result = fileUploadSchema.safeParse({ files, customFileName: fileName });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0]?.toString() ?? 'files';
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      for (const f of files) {
        formData.append('files', f);
      }
      formData.append('source', 'Upload');
      formData.append('name', fileName);
      toast.loading('Uploading files...', { id: 'file-upload' });
      await createFile(formData);
      await queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Files uploaded successfully!', { id: 'file-upload' });
      setFiles([]);
      setFileName('');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload files', {
        id: 'file-upload',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {/* Left — form */}
      <Card>
        <CardHeader className="border-b bg-muted/30 pb-4">
          <CardTitle className="text-base">Upload Customer File</CardTitle>
          <CardDescription>Give the list a name, then drop your spreadsheet below.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field data-invalid={!!errors.customFileName}>
              <FieldLabel htmlFor="upload-name">List Name</FieldLabel>
              <Input
                id="upload-name"
                placeholder="e.g. March 2025 Customers"
                value={fileName}
                onChange={(e) => {
                  setFileName(e.target.value);
                  setErrors((prev) => ({ ...prev, customFileName: '' }));
                }}
              />
              <FieldError>{errors.customFileName}</FieldError>
            </Field>

            {/* Drop zone */}
            <Field data-invalid={!!errors.files}>
              <section
                aria-label="File upload drop zone"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'rounded-xl border-2 border-dashed transition-colors',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40',
                  errors.files ? 'border-destructive/50' : '',
                )}
              >
                <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                      isDragging ? 'bg-primary/10' : 'bg-muted',
                    )}
                  >
                    <Upload
                      className={cn(
                        'h-6 w-6',
                        isDragging ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Supports CSV, XLS, XLSX — up to 10 MB
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                          if (e.target.files?.length) {
                            setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
                            setErrors((prev) => ({ ...prev, files: '' }));
                          }
                        }}
                      />
                    </label>
                  </Button>
                </div>
              </section>

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${file.size}-${idx}`}
                      className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5"
                    >
                      <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
                      <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <FieldError>{errors.files}</FieldError>
            </Field>

            <div className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? 'Uploading...' : 'Upload File'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Right — requirements */}
      <div className="space-y-4">
        <Card className="border-blue-200/60 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm text-blue-900 dark:text-blue-100">
              Required Columns
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {[
                { col: 'Customer Name', alt: 'or: Customer', required: true },
                { col: 'Mobile Number', alt: 'or: Mobile No', required: true },
                { col: 'Email ID', alt: 'or: Email', required: false },
              ].map(({ col, alt, required }) => (
                <li key={col} className="flex flex-col">
                  <span className="text-[12.5px] font-semibold text-blue-800 dark:text-blue-200">
                    {col}
                    {required && <span className="ml-1 text-red-500">*</span>}
                  </span>
                  <span className="text-[11px] text-blue-600/70 dark:text-blue-400/70">{alt}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10.5px] text-blue-600/60 dark:text-blue-400/60">
              * Required columns
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/60 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardContent className="px-4 py-3">
            <p className="text-[11.5px] text-amber-800 dark:text-amber-200 leading-relaxed">
              <span className="font-semibold">Tip:</span> Make sure your first row is a header row
              with column names. Each subsequent row is one customer.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── WhatsApp Tab ──────────────────────────────────────────────────────────────

function WhatsAppTab({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Step 1: load connected accounts to get the WABA phone number
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

  // Step 2: load unique conversations for that phone number
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
      for (const c of chosen) {
        csvRows.push(`${c.name},${c.phone},${c.email ?? ''}`);
      }
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], `wa-import-${Date.now()}.csv`, { type: 'text/csv' });
      const formData = new FormData();
      formData.append('files', csvFile);
      formData.append('source', 'WhatsApp');
      formData.append('name', `WhatsApp Import ${new Date().toLocaleDateString()}`);
      await createFile(formData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('WhatsApp contacts imported successfully!');
      setSelected(new Set());
      onSuccess();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    },
  });

  const toggleAll = () => {
    if (selected.size === contacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map((c) => c.id)));
    }
  };

  const toggleContact = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {/* Left — contact list */}
      <Card>
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Select Contacts</CardTitle>
              <CardDescription className="mt-0.5">
                Choose which WhatsApp contacts to import as recipients.
              </CardDescription>
            </div>
            {contacts.length > 0 && (
              <Button variant="outline" size="sm" onClick={toggleAll} className="shrink-0">
                {selected.size === contacts.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Search */}
          <div className="border-b px-4 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Contact rows */}
          <div className="max-h-80 overflow-y-auto divide-y">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading contacts...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
                  <MessageCircle className="h-5 w-5 text-rose-500" />
                </div>
                <p className="text-sm font-medium">
                  {isAuthError ? 'Session expired' : 'Could not load contacts'}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {isAuthError
                    ? 'Please log out and log back in to refresh your session, then try again.'
                    : error instanceof Error
                      ? error.message
                      : 'An error occurred loading WhatsApp contacts.'}
                </p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No contacts found</p>
                <p className="text-xs text-muted-foreground">
                  Contacts added via your WhatsApp Business account will appear here.
                </p>
              </div>
            ) : (
              contacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                    className="h-4 w-4 rounded accent-emerald-600"
                  />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{contact.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{contact.phone}</p>
                  </div>
                  {contact.email && (
                    <p className="hidden truncate text-xs text-muted-foreground sm:block max-w-36">
                      {contact.email}
                    </p>
                  )}
                </label>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {selected.size > 0 ? (
                <span className="font-semibold text-foreground">{selected.size}</span>
              ) : (
                '0'
              )}{' '}
              of {contacts.length} selected
            </p>
            <Button
              onClick={() => doImport()}
              disabled={selected.size === 0 || isPending}
              className="min-w-28"
            >
              {isPending
                ? 'Importing...'
                : `Import${selected.size > 0 ? ` (${selected.size})` : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right — info */}
      <Card className="border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20 self-start">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm text-emerald-900 dark:text-emerald-100">
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {[
            'Selected contacts are saved as a new recipient file.',
            'You can then use this file in any campaign.',
            'Contacts without a phone number are skipped.',
          ].map((text) => (
            <div key={text} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <p className="text-[11.5px] text-emerald-800 dark:text-emerald-200 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Manual Entry Tab ──────────────────────────────────────────────────────────

function ManualTab({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<ManualRow[]>([
    { id: crypto.randomUUID(), name: '', phone: '', email: '' },
  ]);
  const [listName, setListName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addRow = () => {
    setRows((prev) => [...prev, { id: crypto.randomUUID(), name: '', phone: '', email: '' }]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, key: keyof Omit<ManualRow, 'id'>, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const validRows = rows.filter((r) => r.name.trim() && r.phone.trim());
  const canSave = validRows.length > 0 && listName.trim();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const csvRows = ['Customer Name,Mobile Number,Email ID'];
      for (const r of validRows) {
        csvRows.push(`${r.name.trim()},${r.phone.trim()},${r.email.trim()}`);
      }
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], `${listName.trim()}.csv`, { type: 'text/csv' });
      const formData = new FormData();
      formData.append('files', csvFile);
      formData.append('source', 'Manual');
      formData.append('name', listName.trim());
      toast.loading('Saving recipients...', { id: 'manual-save' });
      await createFile(formData);
      await queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Recipients saved successfully!', { id: 'manual-save' });
      setRows([{ id: crypto.randomUUID(), name: '', phone: '', email: '' }]);
      setListName('');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save recipients', {
        id: 'manual-save',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b bg-muted/30 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Enter Recipients Manually</CardTitle>
            <CardDescription className="mt-0.5">
              Fill in each row below. Name and phone are required.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Input
              placeholder="Name this list, e.g. March Leads"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="h-8 w-52 text-sm"
            />
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Row
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 border-b bg-muted/40 px-4 py-2">
          <span className="w-6 text-center text-[10px] font-semibold text-muted-foreground">#</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Full Name <span className="text-destructive">*</span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Phone <span className="text-destructive">*</span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Email
          </span>
          <span className="w-8" />
        </div>

        {/* Rows */}
        <div className="max-h-80 overflow-y-auto divide-y">
          {rows.map((row, idx) => {
            const isValid = row.name.trim() && row.phone.trim();
            return (
              <div
                key={row.id}
                className={cn(
                  'grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 px-4 py-2 transition-colors',
                  isValid ? 'bg-transparent' : 'bg-muted/10',
                )}
              >
                <span className="w-6 text-center text-[11px] font-medium text-muted-foreground">
                  {idx + 1}
                </span>
                <Input
                  placeholder="John Smith"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="+91 98765 43210"
                  value={row.phone}
                  onChange={(e) => updateRow(row.id, 'phone', e.target.value)}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="email@example.com"
                  value={row.email}
                  onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{validRows.length}</span> of{' '}
              {rows.length} {rows.length === 1 ? 'row' : 'rows'} valid
            </p>
            {!listName.trim() && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Enter a list name to save
              </p>
            )}
          </div>
          <Button onClick={handleSave} disabled={!canSave || isSaving} className="min-w-32">
            {isSaving ? 'Saving...' : 'Save Recipients'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function FilesList() {
  const [activeTab, setActiveTab] = useState('files');
  const handleSuccess = () => setActiveTab('files');

  const { data: filesCheck, isFetched: filesCheckFetched } = useQuery<FilesResponse>({
    queryKey: ['files', { page: 1, limit: 10 }],
    queryFn: () => getAllFiles(1, 10),
  });
  const hasNoFiles = filesCheckFetched && (filesCheck?.meta?.total ?? 0) === 0;

  const pageHeader = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Recipients</h1>
          <p className="text-sm text-muted-foreground">Manage the people you send campaigns to</p>
        </div>
      </div>
    </div>
  );

  if (hasNoFiles && activeTab === 'files') {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
        {pageHeader}
        <EmptyState onSwitchTab={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
      {pageHeader}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto gap-1 p-1">
          <TabsTrigger value="files" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Uploaded Files
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
            <Upload className="h-3.5 w-3.5" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
            <Pencil className="h-3.5 w-3.5" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-4">
          <Suspense
            fallback={<div className="flex items-center justify-center p-8">Loading...</div>}
          >
            <FilesTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <UploadTab onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-4">
          <WhatsAppTab onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <ManualTab onSuccess={handleSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
