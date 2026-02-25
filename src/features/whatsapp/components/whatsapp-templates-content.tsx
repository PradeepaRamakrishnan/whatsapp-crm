'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bold,
  Check,
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Italic,
  Mic,
  Paperclip,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Smile,
  Strikethrough,
  Trash2,
  Video,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import type { WhatsAppComponent, WhatsAppTemplate } from '@/features/settings/types';
import {
  createTemplate,
  getAllAccounts,
  getAllTemplates,
  submitTemplate,
  syncTemplates,
} from '@/features/whatsapp/services';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonType = 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
type HeaderType = 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
type CategoryType = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
type PreviewMode = 'light' | 'dark';

interface ButtonConfig {
  id: string;
  type: ButtonType;
  text: string;
  url?: string;
  phone?: string;
}

interface FormState {
  name: string;
  accountId: string;
  category: CategoryType;
  language: string;
  headerType: HeaderType;
  headerText: string;
  body: string;
  footer: string;
  buttons: ButtonConfig[];
}

interface TemplateAccountOption {
  id: string;
  wabaId: string;
  wabaName: string;
  phoneNumber: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  accountId: '',
  category: 'UTILITY',
  language: 'en',
  headerType: 'NONE',
  headerText: '',
  body: '',
  footer: '',
  buttons: [],
};

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'bn', label: 'Bengali' },
  { value: 'pa', label: 'Punjabi' },
];

const CATEGORIES = [
  { value: 'MARKETING' as const, label: 'Marketing', desc: 'Promotions & offers' },
  { value: 'UTILITY' as const, label: 'Utility', desc: 'Transactional updates' },
  { value: 'AUTHENTICATION' as const, label: 'Authentication', desc: 'OTPs & security' },
];

const HEADER_TYPES = [
  { value: 'NONE' as const, label: 'None' },
  { value: 'TEXT' as const, label: 'Text' },
  { value: 'IMAGE' as const, label: 'Image' },
  { value: 'VIDEO' as const, label: 'Video' },
  { value: 'DOCUMENT' as const, label: 'Document' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadgeClass(status: string) {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'PENDING':
    case 'IN_REVIEW':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'DRAFT':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function extractArraySources(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  if (!isObject(response)) return [];
  const containerCandidates = [response, response.data, response.result, response.payload].filter(
    isObject,
  );
  const listKeys = ['accounts', 'templates', 'data', 'items', 'rows', 'results'] as const;
  for (const container of containerCandidates) {
    for (const key of listKeys) {
      const value = container[key];
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

function normalizeTemplateAccount(input: unknown): TemplateAccountOption | null {
  if (!isObject(input)) return null;
  const source =
    (isObject(input.data) && input.data) ||
    (isObject(input.result) && input.result) ||
    (isObject(input.payload) && input.payload) ||
    input;
  const id = String(source.id || source.accountId || source.account_id || '').trim();
  if (!id) return null;
  const wabaId = String(source.wabaId || source.waba_id || source.businessAccountId || id).trim();
  const wabaName = String(
    source.wabaName || source.waba_name || source.name || source.verified_name || 'Unnamed WABA',
  ).trim();
  const primaryPhone = Array.isArray(source.phoneNumbers)
    ? source.phoneNumbers.find((phone) => isObject(phone))
    : undefined;
  const phoneNumber = String(
    source.phoneNumber ||
      source.phone ||
      (isObject(primaryPhone)
        ? primaryPhone.display_phone_number || primaryPhone.phoneNumber
        : '') ||
      '-',
  ).trim();
  return { id, wabaId, wabaName, phoneNumber: phoneNumber || '-' };
}

function normalizeTemplateAccounts(response: unknown): TemplateAccountOption[] {
  const raw = extractArraySources(response);
  const optionsFromList = raw
    .map(normalizeTemplateAccount)
    .filter((option): option is TemplateAccountOption => !!option);
  const fallback = normalizeTemplateAccount(response);
  const options = fallback ? [...optionsFromList, fallback] : optionsFromList;
  const unique = new Map<string, TemplateAccountOption>();
  for (const option of options) unique.set(option.id, option);
  return Array.from(unique.values());
}

function normalizeTemplateComponents(input: unknown): WhatsAppComponent[] {
  const toUiButtonType = (rawType: unknown): 'QUICK_REPLY' | 'URL' => {
    const upper = String(rawType || '').toUpperCase();
    return upper === 'URL' ? 'URL' : 'QUICK_REPLY';
  };

  if (Array.isArray(input)) {
    return input
      .filter((item) => isObject(item))
      .map((item) => ({
        type: String(item.type || 'BODY') as WhatsAppComponent['type'],
        format: item.format ? (String(item.format) as WhatsAppComponent['format']) : undefined,
        text: item.text ? String(item.text) : undefined,
        buttons: Array.isArray(item.buttons)
          ? item.buttons
              .filter((button) => isObject(button))
              .map((button) => ({
                type: toUiButtonType(button.type),
                text: String(button.text || ''),
                url: button.url ? String(button.url) : undefined,
              }))
          : undefined,
      }));
  }

  if (!isObject(input)) return [];

  const components: WhatsAppComponent[] = [];
  if (isObject(input.header)) {
    components.push({
      type: 'HEADER',
      format: input.header.format
        ? (String(input.header.format) as WhatsAppComponent['format'])
        : 'TEXT',
      text: input.header.text ? String(input.header.text) : undefined,
    });
  }
  if (input.body) {
    components.push({ type: 'BODY', text: String(input.body) });
  }
  if (input.footer) {
    components.push({ type: 'FOOTER', text: String(input.footer) });
  }
  if (Array.isArray(input.buttons)) {
    components.push({
      type: 'BUTTONS',
      buttons: input.buttons
        .filter((button) => isObject(button))
        .map((button) => ({
          type: toUiButtonType(button.type),
          text: String(button.text || ''),
          url: button.url ? String(button.url) : undefined,
        })),
    });
  }
  return components;
}

function normalizeTemplate(input: unknown): WhatsAppTemplate | null {
  if (!isObject(input)) return null;
  const source =
    (isObject(input.data) && input.data) ||
    (isObject(input.result) && input.result) ||
    (isObject(input.payload) && input.payload) ||
    input;

  const id = String(
    source.id || source.externalTemplateId || source.externalId || source.name || '',
  ).trim();
  if (!id) return null;

  return {
    id,
    externalId: String(source.externalId || source.externalTemplateId || id),
    name: String(source.name || 'unnamed_template'),
    language: String(source.language || 'en'),
    status: String(source.status || 'PENDING'),
    category: String(source.category || 'UTILITY'),
    components: normalizeTemplateComponents(source.components),
    active: source.active !== undefined ? Boolean(source.active) : true,
    isDefault: Boolean(source.isDefault),
    createdAt: String(source.createdAt || new Date().toISOString()),
    updatedAt: String(source.updatedAt || source.createdAt || new Date().toISOString()),
  };
}

function normalizeTemplatesResponse(response: unknown): WhatsAppTemplate[] {
  const raw = extractArraySources(response);
  const fromList = raw.map(normalizeTemplate).filter((row): row is WhatsAppTemplate => !!row);
  const fallback = normalizeTemplate(response);
  const rows = fallback ? [...fromList, fallback] : fromList;
  const unique = new Map<string, WhatsAppTemplate>();
  for (const row of rows) unique.set(row.id, row);
  return Array.from(unique.values());
}

function normalizeTemplateName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function renderPreviewBody(text: string, dark: boolean) {
  if (!text) {
    return (
      <span className={dark ? 'text-slate-500' : 'text-slate-400'}>
        Body text will appear here…
      </span>
    );
  }
  const parts = text.split(/({{[0-9]+}})/g);
  let offset = 0;
  return (
    <>
      {parts.map((part) => {
        const key = `${offset}:${part}`;
        offset += part.length;
        return /^{{[0-9]+}}$/.test(part) ? (
          <span
            key={key}
            className={cn(
              'rounded px-0.5 text-[11px] font-semibold',
              dark ? 'bg-slate-600 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
            )}
          >
            {part}
          </span>
        ) : (
          <span key={key}>{part}</span>
        );
      })}
    </>
  );
}

// ─── Phone Preview Component ──────────────────────────────────────────────────

function PhonePreview({ form, mode }: { form: FormState; mode: PreviewMode }) {
  const dark = mode === 'dark';
  const quickReplies = form.buttons.filter((b) => b.type === 'QUICK_REPLY');
  const ctaButtons = form.buttons.filter((b) => b.type !== 'QUICK_REPLY');
  const hasContent =
    form.headerType !== 'NONE' || form.body.trim() || form.footer.trim() || form.buttons.length > 0;

  return (
    <div
      className={cn(
        'mx-auto flex flex-col overflow-hidden rounded-[2rem] border-[6px] shadow-2xl',
        dark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white',
      )}
      style={{ width: '300px', height: '580px' }}
    >
      {/* Status bar */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-between px-5 py-1 text-[10px] font-medium',
          dark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-500',
        )}
      >
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span>▲▲▲</span>
          <span>100%</span>
        </div>
      </div>

      {/* Chat header */}
      <div className="flex shrink-0 items-center gap-3 bg-[#075E54] px-3 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-900">
          B
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">Business Name</p>
          <p className="text-[10px] text-emerald-200">Online</p>
        </div>
      </div>

      {/* Messages area */}
      <div
        className={cn(
          'flex flex-1 flex-col gap-2 overflow-y-auto p-3',
          dark ? 'bg-[#0a2a40]' : 'bg-[#ECE5DD]',
        )}
      >
        <div className="flex justify-center">
          <span
            className={cn(
              'rounded-md px-3 py-0.5 text-[10px]',
              dark ? 'bg-slate-700 text-slate-400' : 'bg-[#c9c5b0] text-[#54523e]',
            )}
          >
            Today
          </span>
        </div>

        {hasContent ? (
          <div className="flex flex-col gap-1.5">
            {/* Message bubble */}
            <div
              className={cn(
                'max-w-[92%] overflow-hidden rounded-br-2xl rounded-tr-2xl rounded-tl-sm shadow-sm',
                dark ? 'bg-slate-800' : 'bg-white',
              )}
            >
              {/* Image header placeholder */}
              {form.headerType === 'IMAGE' ? (
                <div
                  className={cn(
                    'flex h-28 w-full items-center justify-center',
                    dark ? 'bg-slate-700' : 'bg-slate-200',
                  )}
                >
                  <ImageIcon
                    className={cn('h-8 w-8', dark ? 'text-slate-500' : 'text-slate-400')}
                  />
                </div>
              ) : null}

              {/* Video header placeholder */}
              {form.headerType === 'VIDEO' ? (
                <div
                  className={cn(
                    'flex h-28 w-full items-center justify-center',
                    dark ? 'bg-slate-700' : 'bg-slate-200',
                  )}
                >
                  <Video className={cn('h-8 w-8', dark ? 'text-slate-500' : 'text-slate-400')} />
                </div>
              ) : null}

              {/* Document header placeholder */}
              {form.headerType === 'DOCUMENT' ? (
                <div
                  className={cn(
                    'flex items-center gap-2 border-b px-3 py-2',
                    dark ? 'border-slate-700 bg-slate-700/40' : 'border-slate-100 bg-slate-50',
                  )}
                >
                  <FileText
                    className={cn('h-5 w-5 shrink-0', dark ? 'text-slate-400' : 'text-slate-500')}
                  />
                  <span
                    className={cn('truncate text-xs', dark ? 'text-slate-300' : 'text-slate-600')}
                  >
                    Document.pdf
                  </span>
                </div>
              ) : null}

              <div className="px-3 py-2.5">
                {/* Text header */}
                {form.headerType === 'TEXT' && form.headerText ? (
                  <p
                    className={cn(
                      'mb-1.5 text-sm font-bold',
                      dark ? 'text-white' : 'text-slate-900',
                    )}
                  >
                    {form.headerText}
                  </p>
                ) : null}

                {/* Body text */}
                <p
                  className={cn(
                    'text-[13px] leading-relaxed',
                    dark ? 'text-slate-100' : 'text-slate-900',
                  )}
                >
                  {renderPreviewBody(form.body, dark)}
                </p>

                {/* Footer */}
                {form.footer ? (
                  <p
                    className={cn('mt-1.5 text-[11px]', dark ? 'text-slate-400' : 'text-slate-500')}
                  >
                    {form.footer}
                  </p>
                ) : null}

                {/* Timestamp */}
                <div className="mt-1 flex justify-end">
                  <span className={cn('text-[10px]', dark ? 'text-slate-500' : 'text-slate-400')}>
                    10:30 ✓✓
                  </span>
                </div>
              </div>

              {/* CTA buttons inside bubble */}
              {ctaButtons.length > 0 ? (
                <div className={cn('border-t', dark ? 'border-slate-700' : 'border-slate-200')}>
                  {ctaButtons.map((btn, i) => (
                    <div
                      key={btn.id}
                      className={cn(
                        'flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-medium',
                        i > 0 && (dark ? 'border-t border-slate-700' : 'border-t border-slate-200'),
                        dark ? 'text-blue-400' : 'text-[#025F4C]',
                      )}
                    >
                      {btn.type === 'URL' ? (
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="truncate">
                        {btn.text || (btn.type === 'URL' ? 'Visit Website' : 'Call Us')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Quick Reply buttons below bubble */}
            {quickReplies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((btn) => (
                  <div
                    key={btn.id}
                    className={cn(
                      'rounded-xl border px-3 py-1.5 text-[12px] font-medium shadow-sm',
                      dark
                        ? 'border-slate-600 bg-slate-800 text-blue-400'
                        : 'border-white/80 bg-white text-[#025F4C]',
                    )}
                  >
                    {btn.text || 'Quick Reply'}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className={cn('text-center text-xs', dark ? 'text-slate-600' : 'text-slate-400')}>
              Add content to see preview
            </p>
          </div>
        )}
      </div>

      {/* Message input bar */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-2 px-2 py-2',
          dark ? 'bg-slate-900' : 'bg-[#F0F0F0]',
        )}
      >
        <div
          className={cn(
            'flex flex-1 items-center gap-2 rounded-full px-3 py-1.5',
            dark ? 'bg-slate-800' : 'bg-white',
          )}
        >
          <Smile className={cn('h-4 w-4 shrink-0', dark ? 'text-slate-500' : 'text-slate-400')} />
          <span className={cn('flex-1 text-xs', dark ? 'text-slate-500' : 'text-slate-400')}>
            Type a message
          </span>
          <Paperclip
            className={cn('h-3.5 w-3.5 shrink-0', dark ? 'text-slate-500' : 'text-slate-400')}
          />
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#075E54]">
          <Mic className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── Template Detail Sheet ────────────────────────────────────────────────────

function TemplateDetailSheet({
  template,
  onClose,
}: {
  template: WhatsAppTemplate | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!template} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-mono text-base">{template?.name}</SheetTitle>
          <SheetDescription>Template details and components</SheetDescription>
        </SheetHeader>

        {template ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-2">
            <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="mt-0.5 font-medium capitalize">{template.category?.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="mt-0.5 font-medium">{template.language}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className={cn('mt-0.5', statusBadgeClass(template.status || 'unknown'))}>
                  {template.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="mt-0.5 font-medium">
                  {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            {template.components.map((comp) => (
              <div key={comp.type} className="rounded-xl border bg-muted/20 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {comp.type}
                  {comp.format ? ` · ${comp.format}` : ''}
                </p>
                {comp.text ? <p className="whitespace-pre-wrap text-sm">{comp.text}</p> : null}
                {comp.buttons?.map((btn) => (
                  <div
                    key={`${btn.type}-${btn.text}`}
                    className="mt-2 flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium uppercase text-muted-foreground">
                      {btn.type}
                    </span>
                    <span className="font-medium">{btn.text}</span>
                    {btn.url ? <span className="truncate text-blue-600">{btn.url}</span> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WhatsAppTemplatesContent() {
  const queryClient = useQueryClient();

  // List state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);

  // Create sheet state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('light');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: () => getAllTemplates(),
  });

  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['whatsapp-accounts'],
    queryFn: getAllAccounts,
    enabled: true,
  });

  const accounts = useMemo(() => normalizeTemplateAccounts(accountsData), [accountsData]);

  const syncMutation = useMutation({
    mutationFn: syncTemplates,
    onMutate: () => toast.loading('Syncing…', { id: 'waba-sync' }),
    onSuccess: (res) => {
      toast.success(res.message || 'Templates synced', { id: 'waba-sync' });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
    onError: (err: Error) => toast.error(err.message, { id: 'waba-sync' }),
  });

  const draftMutation = useMutation({
    mutationFn: createTemplate,
    onMutate: () => toast.loading('Saving draft…', { id: 'waba-draft' }),
    onSuccess: () => {
      toast.success('Template saved as draft', { id: 'waba-draft' });
      setIsCreateOpen(false);
      setForm(INITIAL_FORM);
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to save draft', { id: 'waba-draft' }),
  });

  const submitMutation = useMutation({
    mutationFn: submitTemplate,
    onMutate: () => toast.loading('Sending for verification…', { id: 'waba-submit' }),
    onSuccess: () => {
      toast.success('Template submitted for review', { id: 'waba-submit' });
      setIsCreateOpen(false);
      setForm(INITIAL_FORM);
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to submit template', { id: 'waba-submit' }),
  });

  // ── Table rows ─────────────────────────────────────────────────────────────

  const apiRows = useMemo(() => normalizeTemplatesResponse(data), [data]);

  const allRows = useMemo(() => apiRows, [apiRows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((row) => {
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.category?.toLowerCase().includes(q) ||
        row.language?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || row.status?.toUpperCase() === statusFilter;
      const matchCategory =
        categoryFilter === 'ALL' || row.category?.toUpperCase() === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [allRows, search, statusFilter, categoryFilter]);

  // ── Text insertion helpers ─────────────────────────────────────────────────

  const insertAtCursor = (text: string) => {
    const el = bodyRef.current;
    if (!el) {
      setForm((prev) => ({ ...prev, body: prev.body + text }));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const newVal = el.value.slice(0, start) + text + el.value.slice(end);
    setForm((prev) => ({ ...prev, body: newVal }));
    requestAnimationFrame(() => {
      el.selectionStart = start + text.length;
      el.selectionEnd = start + text.length;
      el.focus();
    });
  };

  const wrapSelection = (marker: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = el.value.slice(start, end) || 'text';
    const newVal = `${el.value.slice(0, start)}${marker}${selected}${marker}${el.value.slice(end)}`;
    setForm((prev) => ({ ...prev, body: newVal }));
    requestAnimationFrame(() => {
      el.selectionStart = start + marker.length;
      el.selectionEnd = start + marker.length + selected.length;
      el.focus();
    });
  };

  // ── Button management ──────────────────────────────────────────────────────

  const addButton = (type: ButtonType) => {
    if (form.buttons.length >= 3) {
      toast.error('Maximum 3 buttons allowed');
      return;
    }
    setForm((prev) => ({
      ...prev,
      buttons: [...prev.buttons, { id: `btn-${Date.now()}`, type, text: '', url: '', phone: '' }],
    }));
  };

  const updateButton = (id: string, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons.map((btn) => (btn.id === id ? { ...btn, [field]: value } : btn)),
    }));
  };

  const removeButton = (id: string) => {
    setForm((prev) => ({ ...prev, buttons: prev.buttons.filter((btn) => btn.id !== id) }));
  };

  // ── Variable tracking ──────────────────────────────────────────────────────

  const variableCount = useMemo(() => {
    const matches = form.body.match(/{{[0-9]+}}/g);
    if (!matches) return 0;
    return new Set(matches.map((m) => m.replace(/[^0-9]/g, ''))).size;
  }, [form.body]);

  // ── Build API payload ──────────────────────────────────────────────────────

  const buildComponents = (): Record<string, unknown>[] => {
    const components: Record<string, unknown>[] = [];

    if (form.headerType !== 'NONE') {
      const header: Record<string, unknown> = { type: 'HEADER', format: form.headerType };
      if (form.headerType === 'TEXT') header.text = form.headerText;
      components.push(header);
    }

    if (form.body) components.push({ type: 'BODY', text: form.body });
    if (form.footer) components.push({ type: 'FOOTER', text: form.footer });

    if (form.buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: form.buttons.map((btn) => {
          const button: Record<string, unknown> = { type: btn.type, text: btn.text };
          if (btn.type === 'URL') button.url = btn.url;
          if (btn.type === 'PHONE_NUMBER') button.phone_number = btn.phone;
          return button;
        }),
      });
    }

    return components;
  };

  // ── Submit handlers ────────────────────────────────────────────────────────

  const handleSaveAsDraft = () => {
    if (!form.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!form.accountId) {
      toast.error('Please select a WhatsApp Business Account');
      return;
    }
    draftMutation.mutate({
      name: normalizeTemplateName(form.name),
      accountId: form.accountId,
      language: form.language,
      category: form.category,
      components: buildComponents(),
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!form.accountId) {
      toast.error('Please select a WhatsApp Business Account');
      return;
    }
    if (!form.body.trim()) {
      toast.error('Message body is required');
      return;
    }
    if (form.headerType === 'TEXT' && !form.headerText.trim()) {
      toast.error('Header text is required when header type is Text');
      return;
    }
    submitMutation.mutate({
      name: normalizeTemplateName(form.name),
      accountId: form.accountId,
      language: form.language,
      category: form.category,
      components: buildComponents(),
    });
  };

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setPreviewMode('dark');
    setIsCreateOpen(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const accountId = form.accountId || accounts[0]?.id;
              if (!accountId) {
                toast.error('Please connect/select a WhatsApp account to sync templates');
                return;
              }
              syncMutation.mutate({ accountId });
            }}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={cn('h-4 w-4', syncMutation.isPending && 'animate-spin')} />
            Sync
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading templates…
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No templates found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedTemplate(row)}
                >
                  <TableCell className="font-mono text-sm font-medium">{row.name}</TableCell>
                  <TableCell className="capitalize">{row.category?.toLowerCase() ?? '-'}</TableCell>
                  <TableCell>{row.language ?? '-'}</TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize', statusBadgeClass(row.status ?? 'unknown'))}>
                      {row.status ?? 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Template detail sheet */}
      <TemplateDetailSheet template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />

      {/* Create template sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent
          side="right"
          className="!inset-y-4 !right-4 !h-[calc(100%-2rem)] !w-[min(1160px,calc(100vw-2rem))] !max-w-none overflow-hidden rounded-2xl border bg-white p-0 text-slate-900 flex flex-col"
        >
          <SheetHeader className="shrink-0 border-b px-6 py-4">
            <SheetTitle className="text-xl font-semibold text-slate-900">
              Create WhatsApp Template
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              Build your template and preview it live before sending for verification.
            </SheetDescription>
          </SheetHeader>

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_380px]">
            {/* LEFT: Form */}
            <div className="flex min-h-0 flex-col overflow-hidden border-r">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="mx-auto max-w-[680px] space-y-7 pb-4">
                  {/* ── Section 1: Template Configuration ───────────────── */}
                  <section className="space-y-4">
                    <h3 className="border-b pb-2 text-sm font-semibold text-slate-900">
                      Template configuration
                    </h3>

                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">
                        Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            name: normalizeTemplateName(e.target.value),
                          }))
                        }
                        placeholder="e.g. order_confirmation"
                        className="h-10"
                      />
                      <p className="text-xs text-slate-400">
                        Lowercase letters, numbers, and underscores only.
                      </p>
                    </div>

                    {/* WhatsApp Business Account */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">
                        WhatsApp Business Account <span className="text-rose-500">*</span>
                      </Label>
                      <Popover open={accountPopoverOpen} onOpenChange={setAccountPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={accountPopoverOpen}
                            className="h-10 w-full justify-between font-normal text-slate-700"
                          >
                            {form.accountId
                              ? (accounts.find((a) => a.id === form.accountId)?.wabaName ??
                                'Select WhatsApp Business Account')
                              : 'Select WhatsApp Business Account'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[--radix-popover-trigger-width] p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Search..." className="h-9" />
                            <CommandList>
                              {accountsLoading ? (
                                <CommandEmpty>Loading accounts…</CommandEmpty>
                              ) : accounts.length === 0 ? (
                                <CommandEmpty>
                                  No connected accounts found. Connect a WhatsApp Business Account
                                  first.
                                </CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {accounts.map((account) => (
                                    <CommandItem
                                      key={account.id}
                                      value={account.wabaName}
                                      onSelect={() => {
                                        setForm((prev) => ({ ...prev, accountId: account.id }));
                                        setAccountPopoverOpen(false);
                                      }}
                                    >
                                      <div className="flex flex-1 flex-col">
                                        <span className="font-medium">{account.wabaName}</span>
                                        <span className="text-xs text-slate-400">
                                          {account.phoneNumber}
                                        </span>
                                      </div>
                                      <Check
                                        className={cn(
                                          'ml-2 h-4 w-4 shrink-0',
                                          form.accountId === account.id
                                            ? 'text-slate-900 opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Language */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">
                        Language <span className="text-rose-500">*</span>
                      </Label>
                      <Select
                        value={form.language}
                        onValueChange={(v) => setForm((prev) => ({ ...prev, language: v }))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </section>

                  {/* ── Section 2: Category ─────────────────────────────── */}
                  <section className="space-y-4">
                    <h3 className="border-b pb-2 text-sm font-semibold text-slate-900">
                      Template content
                    </h3>

                    {/* Category cards */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">
                        Category <span className="text-rose-500">*</span>
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            type="button"
                            key={cat.value}
                            onClick={() => setForm((prev) => ({ ...prev, category: cat.value }))}
                            className={cn(
                              'rounded-xl border p-3 text-left transition-all',
                              form.category === cat.value
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
                            )}
                          >
                            <p className="text-sm font-semibold">{cat.label}</p>
                            <p
                              className={cn(
                                'mt-0.5 text-xs',
                                form.category === cat.value ? 'text-slate-300' : 'text-slate-500',
                              )}
                            >
                              {cat.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* ── Header ──────────────────────────────────────────── */}
                  <section className="space-y-4">
                    <h3 className="border-b pb-2 text-sm font-semibold text-slate-900">
                      Header <span className="font-normal text-slate-400">(optional)</span>
                    </h3>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">Header Type</Label>
                      <div className="flex flex-wrap gap-2">
                        {HEADER_TYPES.map((opt) => (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => setForm((prev) => ({ ...prev, headerType: opt.value }))}
                            className={cn(
                              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-all',
                              form.headerType === opt.value
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400',
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {form.headerType === 'TEXT' ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Header Text</Label>
                        <Input
                          value={form.headerText}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              headerText: e.target.value.slice(0, 60),
                            }))
                          }
                          placeholder="Enter header text…"
                          className="h-10"
                        />
                        <div className="text-right text-xs text-slate-400">
                          {form.headerText.length} / 60
                        </div>
                      </div>
                    ) : null}

                    {form.headerType === 'IMAGE' ||
                    form.headerType === 'VIDEO' ||
                    form.headerType === 'DOCUMENT' ? (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                        {form.headerType === 'IMAGE' ? (
                          <ImageIcon className="h-8 w-8 text-slate-300" />
                        ) : form.headerType === 'VIDEO' ? (
                          <Video className="h-8 w-8 text-slate-300" />
                        ) : (
                          <FileText className="h-8 w-8 text-slate-300" />
                        )}
                        <p className="text-sm font-medium text-slate-600">
                          {form.headerType === 'IMAGE'
                            ? 'Image header'
                            : form.headerType === 'VIDEO'
                              ? 'Video header'
                              : 'Document header'}
                        </p>
                        <p className="text-xs text-slate-400">
                          A sample media URL will be attached. Actual media is uploaded when
                          sending.
                        </p>
                      </div>
                    ) : null}
                  </section>

                  {/* ── Body ────────────────────────────────────────────── */}
                  <section className="space-y-4">
                    <h3 className="border-b pb-2 text-sm font-semibold text-slate-900">
                      Body <span className="text-rose-500">*</span>
                    </h3>

                    {/* Formatting toolbar */}
                    <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => wrapSelection('*')}
                        title="Bold (*text*)"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-slate-200"
                      >
                        <Bold className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => wrapSelection('_')}
                        title="Italic (_text_)"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-slate-200"
                      >
                        <Italic className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => wrapSelection('~')}
                        title="Strikethrough (~text~)"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-slate-200"
                      >
                        <Strikethrough className="h-4 w-4" />
                      </button>

                      <div className="mx-1 h-4 w-px bg-slate-300" />

                      <span className="ml-1 text-xs text-slate-500">Variables:</span>
                      {[1, 2, 3, 4].map((n) => {
                        const enabled = n <= variableCount + 1;
                        return (
                          <button
                            type="button"
                            key={n}
                            onClick={() => enabled && insertAtCursor(`{{${n}}}`)}
                            disabled={!enabled}
                            title={enabled ? `Insert {{${n}}}` : 'Add previous variables first'}
                            className={cn(
                              'rounded px-2 py-1 font-mono text-xs font-medium transition-colors',
                              enabled
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                                : 'cursor-not-allowed text-slate-300',
                            )}
                          >
                            {`{{${n}}}`}
                          </button>
                        );
                      })}
                    </div>

                    <Textarea
                      ref={bodyRef}
                      value={form.body}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          body: e.target.value.slice(0, 1024),
                        }))
                      }
                      placeholder="Enter your message body. Use {{1}}, {{2}} for personalized variables."
                      className="min-h-[140px] resize-none font-mono text-sm"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {variableCount > 0 ? `${variableCount} variable(s) used` : 'No variables'}
                      </span>
                      <span>{form.body.length} / 1024</span>
                    </div>
                  </section>

                  {/* ── Footer ──────────────────────────────────────────── */}
                  <section className="space-y-4">
                    <h3 className="border-b pb-2 text-sm font-semibold text-slate-900">
                      Footer <span className="font-normal text-slate-400">(optional)</span>
                    </h3>

                    <div className="space-y-1.5">
                      <Input
                        value={form.footer}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            footer: e.target.value.slice(0, 60),
                          }))
                        }
                        placeholder="Footer text…"
                        className="h-10"
                      />
                      <div className="text-right text-xs text-slate-400">
                        {form.footer.length} / 60
                      </div>
                    </div>
                  </section>

                  {/* ── Section 5: Buttons ──────────────────────────────── */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Buttons{' '}
                        <span className="font-normal text-slate-400">(optional, max 3)</span>
                      </h3>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={form.buttons.length >= 3}
                            className="h-8 gap-1.5 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Button
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => addButton('QUICK_REPLY')}>
                            Quick Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addButton('URL')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Website
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addButton('PHONE_NUMBER')}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Phone
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {form.buttons.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
                        <p className="text-sm text-slate-400">No buttons added yet.</p>
                        <p className="mt-1 text-xs text-slate-300">
                          Add Quick Reply, Visit Website, or Call Phone buttons.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {form.buttons.map((btn) => (
                          <div
                            key={btn.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span
                                className={cn(
                                  'rounded-md px-2 py-0.5 text-xs font-medium',
                                  btn.type === 'QUICK_REPLY'
                                    ? 'bg-blue-50 text-blue-700'
                                    : btn.type === 'URL'
                                      ? 'bg-violet-50 text-violet-700'
                                      : 'bg-emerald-50 text-emerald-700',
                                )}
                              >
                                {btn.type === 'QUICK_REPLY'
                                  ? 'Quick Reply'
                                  : btn.type === 'URL'
                                    ? 'Visit Website'
                                    : 'Call Phone'}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeButton(btn.id)}
                                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              <Input
                                value={btn.text}
                                onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                                placeholder="Button label"
                                className="h-9 bg-white text-sm"
                                maxLength={25}
                              />
                              {btn.type === 'URL' ? (
                                <Input
                                  value={btn.url ?? ''}
                                  onChange={(e) => updateButton(btn.id, 'url', e.target.value)}
                                  placeholder="https://example.com/{{1}}"
                                  className="h-9 bg-white text-sm"
                                />
                              ) : null}
                              {btn.type === 'PHONE_NUMBER' ? (
                                <Input
                                  value={btn.phone ?? ''}
                                  onChange={(e) => updateButton(btn.id, 'phone', e.target.value)}
                                  placeholder="+91 98765 43210"
                                  className="h-9 bg-white text-sm"
                                />
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>

              {/* Bottom action bar */}
              <div className="flex shrink-0 items-center justify-between border-t bg-white px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-10 min-w-24"
                >
                  Cancel
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleSaveAsDraft}
                    disabled={draftMutation.isPending}
                    className="h-10 text-slate-600 hover:bg-slate-100"
                  >
                    {draftMutation.isPending ? 'Saving…' : 'Save as Draft'}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="h-10 min-w-48"
                  >
                    {submitMutation.isPending ? 'Submitting…' : 'Send for Verification'}
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT: Preview */}
            <div className="flex flex-col overflow-hidden border-l bg-slate-50">
              <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Live Preview</p>
                <div className="flex rounded-lg bg-slate-200 p-0.5">
                  {(['light', 'dark'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPreviewMode(m)}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all',
                        previewMode === m
                          ? m === 'dark'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700',
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  'flex flex-1 items-start justify-center overflow-y-auto p-5',
                  previewMode === 'dark' ? 'bg-slate-900' : 'bg-slate-100',
                )}
              >
                <PhonePreview form={form} mode={previewMode} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
