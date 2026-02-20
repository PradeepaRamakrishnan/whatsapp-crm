'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { getAllWhatsAppTemplates, syncWhatsAppTemplates } from '@/features/settings/services';
import type { WhatsAppTemplate } from '@/features/settings/types';
import { cn } from '@/lib/utils';

interface TemplateRow {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  businessAccount: string;
}

interface CreateTemplateForm {
  name: string;
  businessAccount: string;
  category: string;
  language: string;
  headerType: string;
  body: string;
  footer: string;
  buttonType: string;
}

function normalizeTemplateRows(data: WhatsAppTemplate[] | undefined): TemplateRow[] {
  if (!data) return [];

  return data.map((template) => {
    const unknownTemplate = template as unknown as Record<string, unknown>;
    const businessAccount =
      String(
        unknownTemplate.businessAccount ||
          unknownTemplate.wabaName ||
          unknownTemplate.business_account_name ||
          '-',
      ) || '-';

    return {
      id: template.id,
      name: template.name,
      status: template.status || 'UNKNOWN',
      category: template.category || '-',
      language: template.language || '-',
      businessAccount,
    };
  });
}

function statusBadgeClass(status: string) {
  const value = status.toUpperCase();
  if (value === 'APPROVED') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (value === 'REJECTED') return 'bg-rose-50 text-rose-700 border border-rose-200';
  if (value === 'PENDING' || value === 'IN_REVIEW') {
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
  return 'bg-slate-100 text-slate-700 border border-slate-200';
}

export function WhatsAppTemplatesContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftTemplates, setDraftTemplates] = useState<TemplateRow[]>([]);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('dark');
  const [form, setForm] = useState<CreateTemplateForm>({
    name: '',
    businessAccount: '',
    category: 'UTILITY',
    language: 'English',
    headerType: 'NONE',
    body: '',
    footer: '',
    buttonType: 'NONE',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['whatsapp-template-table'],
    queryFn: getAllWhatsAppTemplates,
  });

  const syncMutation = useMutation({
    mutationFn: syncWhatsAppTemplates,
    onMutate: () =>
      toast.loading('Syncing WhatsApp templates...', {
        id: 'sync-whatsapp-table',
      }),
    onSuccess: (response) => {
      toast.success(response.message || 'Templates synced successfully', {
        id: 'sync-whatsapp-table',
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-template-table'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sync templates', {
        id: 'sync-whatsapp-table',
      });
    },
  });

  const apiRows = normalizeTemplateRows(data?.data);
  const tableRows = useMemo(() => [...draftTemplates, ...apiRows], [draftTemplates, apiRows]);

  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.language.toLowerCase().includes(q) ||
        row.businessAccount.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || row.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tableRows, search, statusFilter]);

  const handleOpenCreate = () => {
    setPreviewMode('dark');
    setForm({
      name: '',
      businessAccount: '',
      category: 'UTILITY',
      language: 'English',
      headerType: 'NONE',
      body: '',
      footer: '',
      buttonType: 'NONE',
    });
    setIsCreateOpen(true);
  };

  const handleSaveAsDraft = () => {
    if (!form.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    const draft: TemplateRow = {
      id: `draft-${Date.now()}`,
      name: form.name.trim(),
      status: 'DRAFT',
      category: form.category,
      language: form.language,
      businessAccount: form.businessAccount || '-',
    };
    setDraftTemplates((prev) => [draft, ...prev]);
    setIsCreateOpen(false);
    toast.success('Template saved as draft');
  };

  const handleSendForVerification = () => {
    if (!form.name.trim() || !form.body.trim()) {
      toast.error('Name and body are required');
      return;
    }

    const pending: TemplateRow = {
      id: `pending-${Date.now()}`,
      name: form.name.trim(),
      status: 'PENDING',
      category: form.category,
      language: form.language,
      businessAccount: form.businessAccount || '-',
    };
    setDraftTemplates((prev) => [pending, ...prev]);
    setIsCreateOpen(false);
    toast.success('Template queued for verification');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name..."
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[170px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Templates
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Business Account</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading templates...
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <Badge className={statusBadgeClass(row.status)}>{row.status}</Badge>
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.language}</TableCell>
                  <TableCell>{row.businessAccount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent
          side="right"
          className="!right-4 !inset-y-4 !h-[calc(100%-2rem)] !w-[min(1120px,calc(100vw-2rem))] !max-w-none rounded-2xl border bg-white p-0 text-slate-900 overflow-hidden flex flex-col"
        >
          <SheetHeader className="border-b px-6 py-4 shrink-0">
            <SheetTitle className="text-slate-900 text-2xl font-semibold">
              Create WhatsApp Template
            </SheetTitle>
            <SheetDescription className="text-slate-600">
              Configure template content and preview before sending for verification.
            </SheetDescription>
          </SheetHeader>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] overflow-hidden">
            <div className="flex min-h-0 flex-col border-r overflow-hidden">
              <div className="mx-auto w-full max-w-[760px] flex-1 overflow-y-auto min-h-0 px-6 py-5 lg:px-7">
                <div className="space-y-3 pb-6">
                  <h3 className="text-sm font-semibold text-slate-900">Template configuration</h3>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Name</Label>
                    <Input
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      className="h-11 rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">WhatsApp Business Account</Label>
                    <Input
                      placeholder="Select WhatsApp Business Account"
                      value={form.businessAccount}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          businessAccount: event.target.value,
                        }))
                      }
                      className="h-11 rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Category</Label>
                      <Select
                        value={form.category}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-slate-300 bg-white text-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTILITY">Utility</SelectItem>
                          <SelectItem value="MARKETING">Marketing</SelectItem>
                          <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Language</Label>
                      <Select
                        value={form.language}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-slate-300 bg-white text-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Tamil">Tamil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h3 className="text-sm font-semibold text-slate-900">Template content</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Header Type</Label>
                    <Select
                      value={form.headerType}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, headerType: value }))}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-300 bg-white text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="IMAGE">Image</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="DOCUMENT">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Body</Label>
                    <Textarea
                      value={form.body}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          body: event.target.value,
                        }))
                      }
                      className="min-h-36 rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                    <div className="text-right text-xs text-slate-500">
                      {form.body.length} / 1024
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Footer</Label>
                    <Input
                      placeholder="Footer Text (Optional)"
                      value={form.footer}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          footer: event.target.value,
                        }))
                      }
                      className="h-11 rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                    <div className="text-right text-xs text-slate-500">
                      {form.footer.length} / 60
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Button Type</Label>
                    <Select
                      value={form.buttonType}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, buttonType: value }))}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-300 bg-white text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                        <SelectItem value="URL">URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between border-t bg-white px-6 py-4 lg:px-7">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-12 min-w-28 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSaveAsDraft}
                  className="h-12 min-w-40 text-slate-700 hover:bg-slate-100"
                >
                  Save as Draft
                </Button>
                <Button onClick={handleSendForVerification} variant={'default'}>
                  Send for Verification
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 p-5 lg:p-6 overflow-y-auto min-h-0">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xl font-semibold text-slate-900">Preview</p>
                <div className="flex rounded-lg bg-slate-200 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('light')}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm',
                      previewMode === 'light'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700',
                    )}
                  >
                    Light mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('dark')}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm',
                      previewMode === 'dark'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-700',
                    )}
                  >
                    Dark mode
                  </button>
                </div>
              </div>
              <div
                className={cn(
                  'mx-auto h-[calc(100vh-14rem)] min-h-[620px] max-w-[460px] rounded-2xl border p-3 shadow-sm',
                  previewMode === 'light'
                    ? 'border-slate-300 bg-white'
                    : 'border-slate-700 bg-[#0b1220]',
                )}
              >
                <div className="rounded-t-xl bg-[#0F7A65] p-4 text-4 font-medium text-white">
                  Business Name
                </div>
                <div
                  className={cn(
                    'flex h-[calc(100%-3.5rem)] flex-col gap-3 rounded-b-xl p-4',
                    previewMode === 'light' ? 'bg-[#E6DDD4]' : 'bg-[#0a2a40]',
                  )}
                >
                  <div
                    className={cn(
                      'ml-auto max-w-[90%] rounded-md px-3 py-2 text-right text-[11px]',
                      previewMode === 'light'
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-slate-600 text-slate-300',
                    )}
                  >
                    12:31
                  </div>

                  {form.headerType === 'IMAGE' ? (
                    <div
                      className={cn(
                        'max-w-[92%] rounded-md px-4 py-6 text-center text-xs',
                        previewMode === 'light'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-slate-700 text-slate-300',
                      )}
                    >
                      [Image Header Preview]
                    </div>
                  ) : null}
                  {form.headerType === 'VIDEO' ? (
                    <div
                      className={cn(
                        'max-w-[92%] rounded-md px-4 py-6 text-center text-xs',
                        previewMode === 'light'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-slate-700 text-slate-300',
                      )}
                    >
                      [Video Header Preview]
                    </div>
                  ) : null}
                  {form.headerType === 'DOCUMENT' ? (
                    <div
                      className={cn(
                        'max-w-[92%] rounded-md px-4 py-6 text-center text-xs',
                        previewMode === 'light'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-slate-700 text-slate-300',
                      )}
                    >
                      [Document Header Preview]
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      'max-w-[92%] rounded-md px-3 py-2 text-sm',
                      previewMode === 'light'
                        ? 'bg-white text-slate-900'
                        : 'bg-slate-800 text-white',
                    )}
                  >
                    {form.body || 'Type template body here...'}
                    {form.footer ? (
                      <div
                        className={cn(
                          'mt-2 border-t pt-2 text-xs',
                          previewMode === 'light'
                            ? 'border-slate-200 text-slate-500'
                            : 'border-slate-700 text-slate-400',
                        )}
                      >
                        {form.footer}
                      </div>
                    ) : null}
                  </div>
                  <div
                    className={cn(
                      'mt-auto flex items-center justify-between rounded-full px-3 py-2 text-xs',
                      previewMode === 'light'
                        ? 'bg-white text-slate-500'
                        : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    <span>Type a message</span>
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
