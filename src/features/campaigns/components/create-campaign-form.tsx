'use client';

import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Info,
  Lightbulb,
  Loader2,
  Mail,
  MessageSquare,
  Minus,
  Plus,
  Search,
  Send,
  Target,
  UserCog,
  XCircle,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getFileById } from '@/features/files/services';
import { fetchFiles as getAllFiles } from '@/features/files/services/client';
import {
  createConfiguration,
  getAllEmailTemplates,
  getAllSmsTemplates,
  getAllWhatsAppTemplates,
} from '@/features/settings/services';
import { createCampaign } from '../services';
import type { CampaignSequenceStep, ManualAction } from '../types';
import { RecordSelectionTable } from './record-selection-table';

type CampaignPriority = 'low' | 'medium' | 'high' | 'urgent';

const STEPS = [
  { id: 1 as const, name: 'Basic Details', desc: 'Name & priority', icon: Zap },
  { id: 2 as const, name: 'Records', desc: 'Select borrower file', icon: FileSpreadsheet },
  { id: 3 as const, name: 'Templates', desc: 'Message sequence', icon: MessageSquare },
  { id: 4 as const, name: 'Timing', desc: 'Schedule or send now', icon: Clock },
  { id: 5 as const, name: 'Review & Launch', desc: 'Confirm and create', icon: Check },
];

const PRIORITY_OPTIONS = [
  {
    value: 'low' as CampaignPriority,
    label: 'Low',
    icon: ArrowDown,
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-400/40',
    desc: 'Routine follow-up, no urgency',
  },
  {
    value: 'medium' as CampaignPriority,
    label: 'Medium',
    icon: Minus,
    bg: 'bg-amber-500',
    ring: 'ring-amber-400/40',
    desc: 'Standard campaign execution',
  },
  {
    value: 'high' as CampaignPriority,
    label: 'High',
    icon: ArrowUp,
    bg: 'bg-orange-500',
    ring: 'ring-orange-400/40',
    desc: 'Needs prompt attention',
  },
  {
    value: 'urgent' as CampaignPriority,
    label: 'Urgent',
    icon: AlertTriangle,
    bg: 'bg-red-500',
    ring: 'ring-red-400/40',
    desc: 'Immediate action required',
  },
];

const CH = {
  whatsapp: {
    icon: Send,
    label: 'WhatsApp',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    pill: 'bg-emerald-100 text-emerald-700',
    desc: 'High open-rate, rich media support',
  },
  sms: {
    icon: MessageSquare,
    label: 'SMS',
    color: 'text-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-800',
    pill: 'bg-sky-100 text-sky-700',
    desc: 'Universal reach, no app needed',
  },
  email: {
    icon: Mail,
    label: 'Email',
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-200 dark:border-violet-800',
    pill: 'bg-violet-100 text-violet-700',
    desc: 'Detailed content, document sharing',
  },
  manual: {
    icon: UserCog,
    label: 'Manual',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    pill: 'bg-rose-100 text-rose-700',
    desc: 'Human-led personalised outreach',
  },
} as const;

const MANUAL_LABELS: Record<ManualAction, string> = {
  call: 'Phone Call',
  manual_whatsapp: 'Manual WhatsApp',
  manual_email: 'Manual Email',
  visit: 'In-Person Visit',
};

const toDelayMs = (v: number, u: 'minutes' | 'hours' | 'days') =>
  u === 'hours' ? v * 3600000 : u === 'days' ? v * 86400000 : v * 60000;
const toCron = (date: string, time: string) => {
  const [, m, d] = date.split('-');
  const [h, min] = time.split(':');
  return `0 ${+min} ${+h} ${+d} ${+m} *`;
};
const nowCron = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 1);
  return `0 ${d.getMinutes()} ${d.getHours()} ${d.getDate()} ${d.getMonth() + 1} *`;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
      {children}
    </p>
  );
}

// ── Right panel info tip ────────────────────────────────────────────────────
function Tip({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="mb-1 text-[12px] font-semibold text-foreground">{title}</p>
        <div className="text-[11.5px] leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

// ── Live summary row ────────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2 ${highlight ? 'bg-primary/5' : 'bg-muted/20'}`}
    >
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span
        className={`text-[12px] font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </span>
    </div>
  );
}

export function CreateCampaignForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedFile, setSelectedFile] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [sequence, setSequence] = useState<CampaignSequenceStep[]>([
    {
      id: Math.random().toString(36).slice(2),
      channel: 'whatsapp',
      templateId: '',
      delayValue: 0,
      delayUnit: 'minutes',
    },
  ]);
  const [selectedSeqStepId, setSelectedSeqStepId] = useState(() => sequence[0]?.id ?? '');

  const addSeqStep = () => {
    const newId = Math.random().toString(36).slice(2);
    setSequence((p) => [
      ...p,
      {
        id: newId,
        channel: p.at(-1)?.channel ?? 'whatsapp',
        templateId: '',
        delayValue: 0,
        delayUnit: 'minutes',
      },
    ]);
    setSelectedSeqStepId(newId);
  };
  const removeSeqStep = (id: string) => {
    setSequence((p) => {
      if (p.length <= 1) return p;
      const newSeq = p.filter((s) => s.id !== id);
      const idx = p.findIndex((s) => s.id === id);
      setSelectedSeqStepId(newSeq[Math.min(idx, newSeq.length - 1)]?.id ?? '');
      return newSeq;
    });
  };
  const updateSeqStep = (id: string, u: Partial<CampaignSequenceStep>) =>
    setSequence((p) => p.map((s) => (s.id === id ? { ...s, ...u } : s)));

  const form = useForm({
    defaultValues: { name: '', priority: 'medium' as CampaignPriority, description: '' },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      setIsSubmitting(true);
      try {
        const steps = sequence
          .filter((s) => s.channel !== 'manual' && s.templateId)
          .map((s, i) => ({
            channel: s.channel as 'email' | 'sms' | 'whatsapp',
            templateId: s.templateId,
            delayMs: i === 0 ? 0 : toDelayMs(s.delayValue, s.delayUnit),
          }));
        const config = await createConfiguration({
          steps,
          cronPattern:
            scheduleMode === 'schedule' && scheduledDate && scheduledTime
              ? toCron(scheduledDate, scheduledTime)
              : nowCron(),
        });
        const emailTemplateId = sequence.find(
          (s) => s.channel === 'email' && s.templateId,
        )?.templateId;
        const smsTemplateId = sequence.find((s) => s.channel === 'sms' && s.templateId)?.templateId;
        const whatsappTemplateId = sequence.find(
          (s) => s.channel === 'whatsapp' && s.templateId,
        )?.templateId;
        const channelOrder = sequence
          .filter((s) => s.channel !== 'manual' && s.templateId)
          .map((s, i) => ({
            channel: s.channel,
            templateId: s.templateId as string,
            delayMs: i === 0 ? 0 : toDelayMs(s.delayValue, s.delayUnit),
          }));
        await createCampaign({
          name: value.name,
          description: value.description,
          source: selectedFileData?.source || '',
          fileId: selectedFile,
          configurationId: config.id,
          emailTemplateId,
          smsTemplateId,
          whatsappTemplateId,
          channelOrder,
        });
        router.push('/campaigns/list');
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to create campaign');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { data: ed, isLoading: el } = useQuery({
    queryKey: ['email-templates'],
    queryFn: getAllEmailTemplates,
  });
  const { data: wd, isLoading: wl } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: getAllWhatsAppTemplates,
  });
  const { data: sd, isLoading: sl } = useQuery({
    queryKey: ['sms-templates'],
    queryFn: getAllSmsTemplates,
  });
  const { data: filesData, isLoading: filesLoading } = useQuery({
    queryKey: ['campaign-recipient-files'],
    queryFn: () => getAllFiles(1, 100),
  });
  const { data: fileDetail, isLoading: fileDetailLoading } = useQuery({
    queryKey: ['campaign-file-detail', selectedFile],
    queryFn: () => getFileById(selectedFile, 1, 500),
    enabled: !!selectedFile,
  });
  const emailTpls = ed?.data ?? [];
  const waTpls = wd?.data ?? [];
  const smsTpls = sd?.data ?? [];
  const tplLoading = el || wl || sl;
  const getTpls = (ch: string) => (ch === 'whatsapp' ? waTpls : ch === 'sms' ? smsTpls : emailTpls);
  const getTplName = (s: CampaignSequenceStep) =>
    getTpls(s.channel).find((t) => t.id === s.templateId)?.name ?? s.templateId ?? '—';

  const filesList = filesData?.data ?? [];
  const selectedFileData = filesList.find((f) => f.id === selectedFile);
  const canNext2 = !!selectedFile;
  const canNext3 =
    sequence.every((s) => s.channel === 'manual' || s.templateId) && sequence.length > 0;
  const currentPriority =
    PRIORITY_OPTIONS.find((p) => p.value === form.getFieldValue('priority')) ?? PRIORITY_OPTIONS[1];
  const selectedSeqStep = sequence.find((s) => s.id === selectedSeqStepId) ?? sequence[0];

  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
      {/* ── LEFT SIDEBAR (step nav) ── */}
      <aside className="flex w-52 shrink-0 flex-col border-r border-border/50 bg-muted/10">
        <div className="flex items-center gap-2.5 border-b border-border/40 px-4 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[12.5px] font-bold leading-tight">New Campaign</p>
            <p className="text-[10px] text-muted-foreground/60">5 steps to launch</p>
          </div>
        </div>

        <nav className="flex-1 py-2">
          {STEPS.map((s) => {
            const done = step > s.id;
            const cur = step === s.id;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => done && setStep(s.id)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all ${cur ? 'bg-primary/8' : done ? 'cursor-pointer hover:bg-muted/40' : 'cursor-default'}`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9.5px] font-bold transition-all ${done ? 'bg-primary text-primary-foreground' : cur ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'bg-muted/60 text-muted-foreground/40'}`}
                >
                  {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[12px] font-semibold leading-tight ${cur ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground/50'}`}
                  >
                    {s.name}
                  </p>
                  <p
                    className={`text-[10px] ${cur ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}
                  >
                    {s.desc}
                  </p>
                </div>
                {cur && <ChevronRight className="h-3 w-3 shrink-0 text-primary" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border/40 px-4 py-3">
          <div className="mb-1 flex justify-between">
            <span className="text-[10px] text-muted-foreground/60">Progress</span>
            <span className="text-[10px] font-bold text-primary">
              {Math.round(((step - 1) / 4) * 100)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-5 py-2.5">
          <div>
            <h2 className="text-[14px] font-bold">{STEPS[step - 1].name}</h2>
            <p className="text-[11px] text-muted-foreground">{STEPS[step - 1].desc}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/campaigns/list')}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Split: form left + info right */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4 | 5);
            else if (step === 4) {
              if (scheduleMode === 'schedule' && (!scheduledDate || !scheduledTime)) return;
              setStep(5);
            } else form.handleSubmit();
          }}
          className="flex flex-1 overflow-hidden"
        >
          {/* ── LEFT: Inputs ── */}
          <div className="flex flex-1 flex-col overflow-hidden border-r border-border/40">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* ══ Step 1 ══ */}
              {step === 1 && (
                <>
                  <div>
                    <FieldLabel>
                      Campaign Name{' '}
                      <span className="text-destructive normal-case font-normal">*</span>
                    </FieldLabel>
                    <form.Field
                      name="name"
                      validators={{ onChange: ({ value }) => (!value ? 'Required' : undefined) }}
                    >
                      {(field) => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                          <Input
                            placeholder="e.g. Q1 ICICI Settlement Drive"
                            className="h-9 text-sm"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                          />
                          {field.state.meta.isTouched && field.state.meta.errors[0] && (
                            <FieldError>{field.state.meta.errors[0]}</FieldError>
                          )}
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  <div>
                    <FieldLabel>
                      Description{' '}
                      <span className="text-destructive normal-case font-normal">*</span>
                    </FieldLabel>
                    <form.Field
                      name="description"
                      validators={{ onChange: ({ value }) => (!value ? 'Required' : undefined) }}
                    >
                      {(field) => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                          <textarea
                            rows={4}
                            placeholder="Describe the campaign goal and target audience..."
                            className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                          />
                          {field.state.meta.isTouched && field.state.meta.errors[0] && (
                            <FieldError>{field.state.meta.errors[0]}</FieldError>
                          )}
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  <div>
                    <FieldLabel>Priority</FieldLabel>
                    <form.Field name="priority">
                      {(field) => (
                        <div className="flex flex-wrap gap-2">
                          {PRIORITY_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const active = field.state.value === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => field.handleChange(opt.value)}
                                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${active ? `border-transparent ${opt.bg} text-white` : 'border-border/60 text-muted-foreground hover:bg-muted/30 hover:text-foreground'}`}
                              >
                                <Icon className="h-3 w-3" />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </form.Field>
                  </div>
                </>
              )}

              {/* ══ Step 2 ══ */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* File picker */}
                  <div className="space-y-2.5">
                    <FieldLabel>Select Recipient File</FieldLabel>

                    {filesLoading ? (
                      <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Loading files…
                      </div>
                    ) : filesList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/10 py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
                          <FileSpreadsheet className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <p className="mt-3 text-[13px] font-semibold text-muted-foreground/70">
                          No files uploaded yet
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/40">
                          Go to Contact Sources to upload a CSV
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Search */}
                        {filesList.length > 4 && (
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
                            <Input
                              placeholder="Search files…"
                              value={fileSearch}
                              onChange={(e) => setFileSearch(e.target.value)}
                              className="h-8 pl-8 text-xs"
                            />
                          </div>
                        )}

                        {/* File list */}
                        <div className="space-y-1.5">
                          {filesList
                            .filter(
                              (f) =>
                                !fileSearch ||
                                f.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
                                f.source.toLowerCase().includes(fileSearch.toLowerCase()),
                            )
                            .map((file) => {
                              const sel = selectedFile === file.id;
                              const statusColors: Record<string, string> = {
                                reviewed:
                                  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
                                processing:
                                  'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
                                pending_review:
                                  'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
                                uploaded:
                                  'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
                                failed:
                                  'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
                                archived: 'bg-muted text-muted-foreground',
                              };
                              const statusClass =
                                statusColors[file.status] ?? 'bg-muted/60 text-muted-foreground/60';
                              return (
                                <button
                                  key={file.id}
                                  type="button"
                                  onClick={() => setSelectedFile(file.id)}
                                  className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                                    sel
                                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                                      : 'border-border/50 bg-background hover:border-border hover:bg-muted/20'
                                  }`}
                                >
                                  {/* Icon */}
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                      sel ? 'bg-primary/15' : 'bg-muted/50 group-hover:bg-muted'
                                    }`}
                                  >
                                    <FileSpreadsheet
                                      className={`h-4.5 w-4.5 transition-colors ${sel ? 'text-primary' : 'text-muted-foreground/50'}`}
                                      style={{ width: 18, height: 18 }}
                                    />
                                  </div>

                                  {/* Info */}
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={`truncate text-[12.5px] font-semibold leading-tight capitalize ${
                                        sel ? 'text-foreground' : 'text-foreground/80'
                                      }`}
                                    >
                                      {file.name}
                                    </p>
                                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                      {file.source && (
                                        <span className="flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/70 capitalize">
                                          <Building2 className="h-2.5 w-2.5" />
                                          {file.source}
                                        </span>
                                      )}
                                      <span
                                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize ${statusClass}`}
                                      >
                                        {file.status.replace('_', ' ')}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground/40">
                                        {file.createdAt.slice(0, 10)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Selection indicator */}
                                  <div
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                      sel
                                        ? 'border-primary bg-primary'
                                        : 'border-border/40 group-hover:border-border/70'
                                    }`}
                                  >
                                    {sel && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                </button>
                              );
                            })}

                          {filesList.filter(
                            (f) =>
                              !fileSearch ||
                              f.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
                              f.source.toLowerCase().includes(fileSearch.toLowerCase()),
                          ).length === 0 && (
                            <p className="py-6 text-center text-[12px] text-muted-foreground/50">
                              No files match "{fileSearch}"
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Record Preview */}
                  {selectedFile && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <FieldLabel>Record Preview</FieldLabel>
                        {fileDetail?.stats && (
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              {fileDetail.stats.totalRecords - fileDetail.stats.totalInvalidRecords}{' '}
                              valid
                            </span>
                            {fileDetail.stats.totalInvalidRecords > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-red-500">
                                <XCircle className="h-3 w-3" />
                                {fileDetail.stats.totalInvalidRecords} invalid
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="rounded-xl border border-border/50 bg-muted/5 p-3.5">
                        <RecordSelectionTable
                          records={fileDetail?.contents?.data ?? []}
                          stats={
                            fileDetail?.stats ?? {
                              totalRecords: 0,
                              totalInvalidRecords: 0,
                            }
                          }
                          isLoading={fileDetailLoading}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ Step 3 ══ */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* ── Flow timeline ── */}
                  <div>
                    <FieldLabel>Message Sequence</FieldLabel>
                    {tplLoading && (
                      <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading templates…
                      </div>
                    )}
                    {/* ── Connected node flow (Bolna-style) ── */}
                    <div className="flex items-start overflow-x-auto pb-2 pt-1">
                      {sequence.map((s, idx) => {
                        const meta = CH[s.channel];
                        const StepIcon = meta.icon;
                        const isActive = selectedSeqStep?.id === s.id;
                        const tplName =
                          s.channel !== 'manual' && s.templateId
                            ? getTplName(s)
                            : s.channel === 'manual'
                              ? MANUAL_LABELS[s.manualAction ?? 'call']
                              : null;
                        return (
                          <div key={s.id} className="flex shrink-0 items-start">
                            {/* Connector */}
                            {idx > 0 && (
                              <div
                                className="flex shrink-0 flex-col items-center"
                                style={{ marginTop: 18 }}
                              >
                                <div className="flex items-center">
                                  <div className="h-px w-5 bg-border/60" />
                                  {s.delayValue > 0 ? (
                                    <span className="whitespace-nowrap rounded-full border border-border/40 bg-muted/40 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground/60">
                                      +{s.delayValue}
                                      {s.delayUnit[0]}
                                    </span>
                                  ) : (
                                    <div className="h-px w-3 bg-border/60" />
                                  )}
                                  <div className="h-px w-5 bg-border/60" />
                                </div>
                              </div>
                            )}

                            {/* Node */}
                            <button
                              type="button"
                              onClick={() => setSelectedSeqStepId(s.id)}
                              className="flex shrink-0 flex-col items-center gap-1.5 text-center"
                              style={{ width: 72 }}
                            >
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                  isActive
                                    ? `${meta.border} ${meta.pill}`
                                    : 'border-border/40 bg-muted/20 hover:border-border/70'
                                }`}
                              >
                                <StepIcon
                                  className={`h-4 w-4 ${isActive ? meta.color : 'text-muted-foreground/50'}`}
                                />
                              </div>
                              <div>
                                <span
                                  className={`block text-[9px] font-bold uppercase tracking-wider ${isActive ? meta.color : 'text-muted-foreground/40'}`}
                                >
                                  Step {idx + 1}
                                </span>
                                <span
                                  className={`block text-[11px] font-semibold leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground/60'}`}
                                >
                                  {meta.label}
                                </span>
                                <span
                                  className={`block max-w-[68px] truncate text-[9.5px] ${tplName ? (isActive ? 'text-muted-foreground' : 'text-muted-foreground/45') : 'italic text-destructive/40'}`}
                                >
                                  {tplName ?? 'No template'}
                                </span>
                              </div>
                            </button>
                          </div>
                        );
                      })}

                      {/* Add Step */}
                      <div className="flex shrink-0 items-start" style={{ marginTop: 0 }}>
                        <div
                          className="flex shrink-0 flex-col items-center"
                          style={{ marginTop: 18 }}
                        >
                          <div className="h-px w-6 bg-border/40" />
                        </div>
                        <button
                          type="button"
                          onClick={addSeqStep}
                          className="flex shrink-0 flex-col items-center gap-1.5 text-center text-muted-foreground transition-all hover:text-primary"
                          style={{ width: 60 }}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-border/40 bg-muted/10 transition-all hover:border-primary/40 hover:bg-primary/5">
                            <Plus className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-[10px] font-medium">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Config panel for selected step ── */}
                  {selectedSeqStep &&
                    (() => {
                      const s = selectedSeqStep;
                      const idx = sequence.findIndex((seq) => seq.id === s.id);
                      const meta = CH[s.channel];
                      const ConfigIcon = meta.icon;
                      return (
                        <div className={`overflow-hidden rounded-xl border-2 ${meta.border}`}>
                          <div
                            className={`flex items-center justify-between border-b border-inherit px-4 py-3 ${meta.bg}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full ${meta.pill}`}
                              >
                                <ConfigIcon className={`h-3.5 w-3.5 ${meta.color}`} />
                              </div>
                              <div>
                                <p className={`text-[12.5px] font-bold ${meta.color}`}>
                                  Step {idx + 1} — {meta.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60">{meta.desc}</p>
                              </div>
                            </div>
                            {sequence.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSeqStep(s.id)}
                                className="rounded-md px-2.5 py-1 text-[11px] text-destructive/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 bg-background/70 p-4">
                            <div>
                              <FieldLabel>Channel</FieldLabel>
                              <Select
                                value={s.channel}
                                onValueChange={(val: CampaignSequenceStep['channel'] | null) =>
                                  val &&
                                  updateSeqStep(s.id, {
                                    channel: val,
                                    templateId: '',
                                    manualAction: val === 'manual' ? 'call' : undefined,
                                  })
                                }
                              >
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="whatsapp">
                                    <div className="flex items-center gap-1.5">
                                      <Send className="h-3.5 w-3.5 text-emerald-600" />
                                      WhatsApp
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="sms">
                                    <div className="flex items-center gap-1.5">
                                      <MessageSquare className="h-3.5 w-3.5 text-sky-600" />
                                      SMS
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="email">
                                    <div className="flex items-center gap-1.5">
                                      <Mail className="h-3.5 w-3.5 text-violet-600" />
                                      Email
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="manual">
                                    <div className="flex items-center gap-1.5">
                                      <UserCog className="h-3.5 w-3.5 text-rose-600" />
                                      Manual
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {s.channel === 'manual' ? (
                              <div>
                                <FieldLabel>Action Type</FieldLabel>
                                <Select
                                  value={s.manualAction ?? 'call'}
                                  onValueChange={(val: ManualAction | null) =>
                                    val && updateSeqStep(s.id, { manualAction: val })
                                  }
                                >
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="call">Phone Call</SelectItem>
                                    <SelectItem value="manual_whatsapp">Manual WhatsApp</SelectItem>
                                    <SelectItem value="manual_email">Manual Email</SelectItem>
                                    <SelectItem value="visit">In-Person Visit</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <div>
                                <FieldLabel>Template</FieldLabel>
                                <Select
                                  value={s.templateId}
                                  onValueChange={(val) =>
                                    updateSeqStep(s.id, { templateId: val ?? '' })
                                  }
                                  disabled={tplLoading}
                                >
                                  <SelectTrigger className="h-9 text-sm">
                                    {tplLoading ? (
                                      <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Loading…
                                      </span>
                                    ) : (
                                      <SelectValue placeholder="Select template…" />
                                    )}
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getTpls(s.channel).map((t) => (
                                      <SelectItem key={t.id} value={t.id}>
                                        {t.name}
                                      </SelectItem>
                                    ))}
                                    {!tplLoading && getTpls(s.channel).length === 0 && (
                                      <SelectItem value="_none" disabled>
                                        No templates found
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {idx > 0 && (
                              <div className="col-span-2">
                                <FieldLabel>Delay After Previous Step</FieldLabel>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={s.delayValue}
                                    className="h-9 w-24 text-sm"
                                    onChange={(e) =>
                                      updateSeqStep(s.id, { delayValue: +e.target.value || 0 })
                                    }
                                  />
                                  <Select
                                    value={s.delayUnit}
                                    onValueChange={(
                                      val: CampaignSequenceStep['delayUnit'] | null,
                                    ) => val && updateSeqStep(s.id, { delayUnit: val })}
                                  >
                                    <SelectTrigger className="h-9 w-32 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="minutes">Minutes</SelectItem>
                                      <SelectItem value="hours">Hours</SelectItem>
                                      <SelectItem value="days">Days</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                </div>
              )}

              {/* ══ Step 4 ══ */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Launch Timing</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          {
                            mode: 'now' as const,
                            Icon: Send,
                            label: 'Send Now',
                            sub: 'Launch immediately',
                          },
                          {
                            mode: 'schedule' as const,
                            Icon: Clock,
                            label: 'Schedule',
                            sub: 'Pick date & time',
                          },
                        ] as const
                      ).map(({ mode, Icon, label, sub }) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setScheduleMode(mode)}
                          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${scheduleMode === mode ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/15' : 'border-border/60 hover:bg-muted/20'}`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${scheduleMode === mode ? 'bg-primary/15' : 'bg-muted/50'}`}
                          >
                            <Icon
                              className={`h-5 w-5 ${scheduleMode === mode ? 'text-primary' : 'text-muted-foreground/50'}`}
                            />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-[13px] font-semibold ${scheduleMode === mode ? '' : 'text-muted-foreground'}`}
                            >
                              {label}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70">{sub}</p>
                          </div>
                          {scheduleMode === mode && (
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {scheduleMode === 'schedule' && (
                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                      <div>
                        <FieldLabel>Date</FieldLabel>
                        <Input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel>Time</FieldLabel>
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ Step 5 Review ══ */}
              {step === 5 && (
                <div className="space-y-3">
                  {[
                    { label: 'Campaign Name', value: form.getFieldValue('name') || '—' },
                    { label: 'Description', value: form.getFieldValue('description') || '—' },
                    { label: 'Priority', value: currentPriority?.label ?? '—' },
                    {
                      label: 'Recipients',
                      value: `File: ${selectedFileData?.name ?? '—'}`,
                    },
                    {
                      label: 'Steps',
                      value: `${sequence.length} step${sequence.length > 1 ? 's' : ''}`,
                    },
                    {
                      label: 'Schedule',
                      value:
                        scheduleMode === 'now' ? 'Send Now' : `${scheduledDate} ${scheduledTime}`,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/10 px-4 py-3"
                    >
                      <span className="w-28 shrink-0 text-[11px] text-muted-foreground/60">
                        {label}
                      </span>
                      <span className="text-[13px] font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border/40 px-5 py-3">
              {step === 5 && submitError && (
                <p className="mb-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] text-destructive">
                  {submitError}
                </p>
              )}
              <div className="flex items-center justify-between">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 text-xs"
                    onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5)}
                  >
                    ← Back
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                    {step} / 5
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 min-w-[120px] px-5 text-xs font-semibold"
                    disabled={
                      isSubmitting || (step === 2 && !canNext2) || (step === 3 && !canNext3)
                    }
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Creating…
                      </span>
                    ) : step === 5 ? (
                      '🚀 Launch Campaign'
                    ) : (
                      'Continue →'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Info Panel ── */}
          <div className="w-72 shrink-0 overflow-y-auto border-l border-border/40 bg-muted/5 p-4 space-y-3">
            {/* Step 1 info */}
            {step === 1 && (
              <>
                <div className="rounded-xl border border-border/50 bg-card p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    <Info className="h-3 w-3" /> Live Preview
                  </p>
                  <div className="space-y-2">
                    <form.Subscribe selector={(s) => s.values.name}>
                      {(name) => (
                        <SummaryRow
                          label="Name"
                          value={
                            name || (
                              <span className="text-muted-foreground/40 font-normal text-xs">
                                Not filled
                              </span>
                            )
                          }
                          highlight={!!name}
                        />
                      )}
                    </form.Subscribe>
                    <form.Subscribe selector={(s) => s.values.priority}>
                      {(priority) => {
                        const p =
                          PRIORITY_OPTIONS.find((o) => o.value === priority) ?? PRIORITY_OPTIONS[1];
                        return (
                          <SummaryRow
                            label="Priority"
                            value={
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold text-white ${p.bg}`}
                              >
                                <p.icon className="h-2.5 w-2.5" />
                                {p.label}
                              </span>
                            }
                          />
                        );
                      }}
                    </form.Subscribe>
                  </div>
                </div>

                <Tip icon={Lightbulb} title="Naming Tips">
                  Use a pattern like <strong>Bank_Month_Goal</strong> — e.g. "ICICI_Jan_Settlement".
                  Makes it easy to search later.
                </Tip>

                <Tip icon={Target} title="Priority Guide">
                  <div className="space-y-1.5 mt-1">
                    {PRIORITY_OPTIONS.map((p) => (
                      <div key={p.value} className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-white text-[9px] ${p.bg}`}
                        >
                          <p.icon className="h-2.5 w-2.5" />
                        </span>
                        <span>
                          <strong>{p.label}:</strong> {p.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </Tip>
              </>
            )}

            {/* Step 2 info */}
            {step === 2 && (
              <>
                {selectedFileData ? (
                  <div className="space-y-2 rounded-xl border border-border/50 bg-card p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      <BarChart3 className="h-3 w-3" /> File Summary
                    </p>
                    <SummaryRow label="Name" value={selectedFileData.name} highlight />
                    <SummaryRow label="Bank" value={selectedFileData.source || '—'} highlight />
                    <SummaryRow
                      label="Status"
                      value={
                        <span className="capitalize">
                          {selectedFileData.status.replace('_', ' ')}
                        </span>
                      }
                    />
                    <SummaryRow label="Uploaded" value={selectedFileData.createdAt.slice(0, 10)} />
                    {fileDetail?.stats && (
                      <>
                        <div className="my-1 border-t border-border/30" />
                        <SummaryRow
                          label="Total"
                          value={fileDetail.stats.totalRecords.toLocaleString()}
                          highlight
                        />
                        <SummaryRow
                          label="Valid"
                          value={
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {(
                                fileDetail.stats.totalRecords - fileDetail.stats.totalInvalidRecords
                              ).toLocaleString()}
                            </span>
                          }
                        />
                        {fileDetail.stats.totalInvalidRecords > 0 && (
                          <SummaryRow
                            label="Invalid"
                            value={
                              <span className="text-red-500">
                                {fileDetail.stats.totalInvalidRecords.toLocaleString()}
                              </span>
                            }
                          />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/10 py-8 text-center">
                    <FileSpreadsheet className="mb-2 h-8 w-8 text-muted-foreground/25" />
                    <p className="text-[12px] text-muted-foreground/50">
                      Select a file to see details
                    </p>
                  </div>
                )}
                <Tip icon={Info} title="File Requirements">
                  Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file. Each row needs
                  borrower name, phone, and settlement amount.
                </Tip>
              </>
            )}

            {/* Step 3 info */}
            {step === 3 && (
              <>
                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    <BarChart3 className="h-3 w-3" /> Sequence Summary
                  </p>
                  <SummaryRow label="Total Steps" value={sequence.length} highlight />
                  {sequence.map((s, idx) => {
                    const meta = CH[s.channel];
                    const Icon = meta.icon;
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${meta.bg} border ${meta.border}`}
                      >
                        <Icon className={`h-3 w-3 shrink-0 ${meta.color}`} />
                        <span className={`text-[11px] font-semibold ${meta.color}`}>
                          {meta.label}
                        </span>
                        {idx > 0 && (
                          <span className="ml-auto text-[10px] text-muted-foreground">
                            +{s.delayValue}
                            {s.delayUnit[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Tip icon={Lightbulb} title="Best Practice">
                  Start with <strong>WhatsApp</strong> for high open rates, follow up with{' '}
                  <strong>SMS</strong> for those who don't respond, then escalate to{' '}
                  <strong>Manual call</strong>.
                </Tip>

                <div className="rounded-xl border border-border/50 bg-card p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Channel Info
                  </p>
                  {sequence.length > 0 &&
                    (() => {
                      const meta = CH[sequence[sequence.length - 1].channel];
                      const Icon = meta.icon;
                      return (
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.bg} ${meta.border}`}
                          >
                            <Icon className={`h-4 w-4 ${meta.color}`} />
                          </div>
                          <div>
                            <p className={`text-[12.5px] font-semibold ${meta.color}`}>
                              {meta.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {meta.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </>
            )}

            {/* Step 4 info */}
            {step === 4 && (
              <>
                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    <Calendar className="h-3 w-3" /> Timing Summary
                  </p>
                  <SummaryRow
                    label="Mode"
                    value={scheduleMode === 'now' ? 'Immediate' : 'Scheduled'}
                    highlight
                  />
                  {scheduleMode === 'schedule' && scheduledDate && (
                    <SummaryRow
                      label="Date"
                      value={new Date(scheduledDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    />
                  )}
                  {scheduleMode === 'schedule' && scheduledTime && (
                    <SummaryRow
                      label="Time"
                      value={new Date(`2000-01-01T${scheduledTime}`).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    />
                  )}
                  <SummaryRow label="Steps" value={sequence.length} />
                  <SummaryRow label="Recipients" value={'0'} />
                </div>

                <Tip icon={Clock} title="Scheduling Tips">
                  Best delivery times are <strong>10am–12pm</strong> and <strong>3pm–6pm</strong> on
                  weekdays. Avoid weekends and late evenings for higher response rates.
                </Tip>

                <Tip icon={Lightbulb} title="Send Now vs Schedule">
                  Use <strong>Send Now</strong> for urgent follow-ups. Use <strong>Schedule</strong>{' '}
                  for planned campaigns where timing affects response rates.
                </Tip>
              </>
            )}

            {/* Step 5 info */}
            {step === 5 && (
              <>
                <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-[12.5px] font-semibold text-green-700 dark:text-green-400">
                      Ready to Launch
                    </p>
                  </div>
                  <p className="text-[11.5px] text-green-600 dark:text-green-500 leading-relaxed">
                    Review the details on the left. Once confirmed, click{' '}
                    <strong>Launch Campaign</strong> to begin outreach.
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Campaign Stats
                  </p>
                  <SummaryRow label="Recipients" value={'0'} highlight />
                  <SummaryRow label="Touchpoints" value={sequence.length} />
                  <SummaryRow
                    label="Channels"
                    value={[...new Set(sequence.map((s) => CH[s.channel].label))].join(', ')}
                  />
                  <SummaryRow
                    label="Timing"
                    value={scheduleMode === 'now' ? 'Immediate' : 'Scheduled'}
                  />
                </div>

                <Tip icon={Lightbulb} title="What Happens Next?">
                  After launch, you can track delivery rates, open rates, and responses from the
                  Campaign Dashboard.
                </Tip>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
