'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import slugify from 'slugify';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllAccounts, getUniqueConversations } from '@/features/whatsapp/services';
import { cn } from '@/lib/utils';
import { fileUploadSchema } from '../lib/validation';
import { createFile } from '../services';

// ─── Types ────────────────────────────────────────────────────────────────────

type ManualRow = { id: string; name: string; phone: string; email: string };
type WaContact = { id: string; name: string; phone: string; email?: string };

// ─── Upload CSV Tab ────────────────────────────────────────────────────────────

function UploadTab({
  onCreated,
  defaultName = '',
}: {
  onCreated: (id: string, name: string) => void;
  defaultName?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [listName, setListName] = useState(defaultName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const result = fileUploadSchema.safeParse({ files, customFileName: listName });
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
      for (const f of files) formData.append('files', f);
      formData.append('source', 'Upload');
      formData.append('name', listName);
      toast.loading('Creating list...', { id: 'file-create' });
      const created = await createFile(formData);
      toast.success('List created!', { id: 'file-create' });
      onCreated(created.id, created.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create list', {
        id: 'file-create',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
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
                value={listName}
                onChange={(e) => {
                  setListName(e.target.value);
                  setErrors((prev) => ({ ...prev, customFileName: '' }));
                }}
              />
              <FieldError>{errors.customFileName}</FieldError>
            </Field>

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
                          setErrors((prev) => ({ ...prev, files: '' }));
                        }
                      }}
                    />
                  </label>
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

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? 'Creating...' : 'Create List'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── WhatsApp Tab ──────────────────────────────────────────────────────────────

function WhatsAppTab({
  onCreated,
  defaultName,
}: {
  onCreated: (id: string, name: string) => void;
  defaultName?: string;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [listName, setListName] = useState(
    defaultName ?? `WhatsApp Import ${new Date().toLocaleDateString()}`,
  );

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
      const csvFile = new File([csvBlob], `${listName}.csv`, { type: 'text/csv' });
      const formData = new FormData();
      formData.append('files', csvFile);
      formData.append('source', 'WhatsApp');
      formData.append('name', listName);
      return createFile(formData);
    },
    onSuccess: (created) => {
      toast.success('List created from WhatsApp contacts!');
      onCreated(created.id, created.name);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Import failed'),
  });

  const toggleAll = () => {
    setSelected(selected.size === contacts.length ? new Set() : new Set(contacts.map((c) => c.id)));
  };

  const toggleContact = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <Card>
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Import from WhatsApp</CardTitle>
              <CardDescription className="mt-0.5">
                Choose contacts and give your new list a name.
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
          <div className="border-b px-4 py-3 space-y-2">
            <div>
              <label htmlFor="wa-list-name" className="text-xs font-medium text-muted-foreground">
                List Name
              </label>
              <Input
                id="wa-list-name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="e.g. WhatsApp Leads March"
                className="mt-1"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading contacts...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-4">
                <MessageCircle className="h-8 w-8 text-rose-400" />
                <p className="text-sm font-medium">
                  {isAuthError ? 'Session expired' : 'Could not load contacts'}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {isAuthError
                    ? 'Please log out and back in, then try again.'
                    : error instanceof Error
                      ? error.message
                      : 'An error occurred.'}
                </p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No contacts found</p>
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
                </label>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{selected.size}</span> of{' '}
              {contacts.length} selected
            </p>
            <Button
              onClick={() => doImport()}
              disabled={selected.size === 0 || isPending || !listName.trim()}
              className="min-w-28"
            >
              {isPending
                ? 'Creating...'
                : `Create List${selected.size > 0 ? ` (${selected.size})` : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20 self-start">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm text-emerald-900 dark:text-emerald-100">
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {[
            'Selected contacts are saved as a new recipient list.',
            'You can add more contacts later from the list detail page.',
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

function ManualTab({
  onCreated,
  defaultName = '',
}: {
  onCreated: (id: string, name: string) => void;
  defaultName?: string;
}) {
  const [rows, setRows] = useState<ManualRow[]>([
    { id: crypto.randomUUID(), name: '', phone: '', email: '' },
  ]);
  const [listName, setListName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);

  const addRow = () =>
    setRows((prev) => [...prev, { id: crypto.randomUUID(), name: '', phone: '', email: '' }]);

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: string, key: keyof Omit<ManualRow, 'id'>, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const validRows = rows.filter((r) => r.name.trim() && r.phone.trim());
  const canSave = validRows.length > 0 && listName.trim();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const csvRows = ['Customer Name,Mobile Number,Email ID'];
      for (const r of validRows)
        csvRows.push(`${r.name.trim()},${r.phone.trim()},${r.email.trim()}`);
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], `${listName.trim()}.csv`, { type: 'text/csv' });
      const formData = new FormData();
      formData.append('files', csvFile);
      formData.append('source', 'Manual');
      formData.append('name', listName.trim());
      toast.loading('Creating list...', { id: 'manual-create' });
      const created = await createFile(formData);
      toast.success('List created!', { id: 'manual-create' });
      onCreated(created.id, created.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create list', {
        id: 'manual-create',
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
              placeholder="List name, e.g. March Leads"
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

        <div className="max-h-72 overflow-y-auto divide-y">
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
            {isSaving ? 'Creating...' : 'Create List'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function FileCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultName = searchParams.get('name') ?? '';

  const handleCreated = (id: string, name: string) => {
    router.push(`/recipients/${slugify(name, { lower: true })}/${id}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {defaultName ? `New List: ${defaultName}` : 'Create Recipient List'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose how you want to add recipients to your new list
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="h-auto gap-1 p-1">
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

        <TabsContent value="upload" className="mt-4">
          <UploadTab onCreated={handleCreated} defaultName={defaultName} />
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-4">
          <WhatsAppTab onCreated={handleCreated} defaultName={defaultName} />
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <ManualTab onCreated={handleCreated} defaultName={defaultName} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
