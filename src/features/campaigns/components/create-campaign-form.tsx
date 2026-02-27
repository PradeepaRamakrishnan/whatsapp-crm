'use client';

import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Check,
  Clock,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllEmailTemplates, getAllWhatsAppTemplates } from '@/features/settings/services';
import type { CampaignSequenceStep, ManualAction } from '../types';
import { RecordSelectionTable } from './record-selection-table';

type CampaignPriority = 'low' | 'medium' | 'high' | 'urgent';

const steps = [
  { id: 1, name: 'Basic Details' },
  { id: 2, name: 'Records' },
  { id: 3, name: 'Templates' },
  { id: 4, name: 'Timing' },
  { id: 5, name: 'Review' },
];

// Mock file data
const mockFiles = [
  { id: '1', name: 'ICICI_Borrowers_Jan_2024.csv', records: 2500, uploadDate: '2024-01-15' },
  { id: '2', name: 'HDFC_Borrowers_Dec_2023.xlsx', records: 1800, uploadDate: '2024-01-10' },
  { id: '3', name: 'SBI_Borrowers_Jan_2024.csv', records: 3200, uploadDate: '2024-01-12' },
];

export function CreateCampaignForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [sequence, setSequence] = useState<CampaignSequenceStep[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      channel: 'whatsapp',
      templateId: '',
      delayValue: 0,
      delayUnit: 'minutes',
    },
  ]);

  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');

  const addSequenceStep = () => {
    const lastStep = sequence[sequence.length - 1];
    const newStep: CampaignSequenceStep = {
      id: Math.random().toString(36).substr(2, 9),
      channel: lastStep?.channel || 'whatsapp',
      templateId: '',
      delayValue: 0,
      delayUnit: 'minutes',
    };
    setSequence([...sequence, newStep]);
  };

  const removeSequenceStep = (id: string) => {
    if (sequence.length <= 1) return;
    setSequence(sequence.filter((s) => s.id !== id));
  };

  const updateSequenceStep = (id: string, updates: Partial<CampaignSequenceStep>) => {
    setSequence(sequence.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const form = useForm({
    defaultValues: {
      name: '',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      description: '',
    },
    onSubmit: async () => {
      router.push('/campaigns/list');
    },
  });

  const { data: emailTemplatesData, isLoading: emailLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: getAllEmailTemplates,
  });
  const { data: waTemplatesData, isLoading: waLoading } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: getAllWhatsAppTemplates,
  });

  const emailTemplates = emailTemplatesData?.data ?? [];
  const smsTemplates: { id: string; name: string }[] = [];
  const whatsappTemplates = waTemplatesData?.data ?? [];
  const templatesLoading = emailLoading || waLoading;

  const selectedFileData = mockFiles.find((f) => f.id === selectedFile);

  const allRequiredTemplatesSelected = sequence.every(
    (s) => s.channel === 'manual' || s.templateId,
  );

  const atLeastOneChannelEnabled = sequence.length > 0;

  const getTemplateName = (s: CampaignSequenceStep) => {
    if (s.channel === 'whatsapp') {
      return whatsappTemplates.find((t) => t.id === s.templateId)?.name ?? s.templateId;
    }
    if (s.channel === 'email') {
      return emailTemplates.find((t) => t.id === s.templateId)?.name ?? s.templateId;
    }
    if (s.channel === 'sms') {
      return s.templateId || '-';
    }
    return '-';
  };

  const manualActionLabel: Record<ManualAction, string> = {
    call: 'Phone Call',
    manual_whatsapp: 'Manual WhatsApp',
    manual_email: 'Manual Email',
    visit: 'In-Person Visit',
  };

  const channelIcon = (channel: CampaignSequenceStep['channel']) =>
    channel === 'whatsapp'
      ? Send
      : channel === 'sms'
        ? MessageSquare
        : channel === 'manual'
          ? UserCog
          : Mail;

  const channelColor = (channel: CampaignSequenceStep['channel']) =>
    channel === 'whatsapp'
      ? 'text-emerald-600'
      : channel === 'sms'
        ? 'text-green-600'
        : channel === 'manual'
          ? 'text-purple-600'
          : 'text-blue-600';

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Campaign</h1>
          <p className="text-sm text-muted-foreground">
            Configure templates, records, and schedule for your campaign
          </p>
        </div>
      </div>

      {/* Stepper */}
      <nav aria-label="Progress" className="overflow-x-auto rounded-lg border bg-card p-3">
        <ol className="flex min-w-[760px] items-center">
          {steps.map((s, idx) => (
            <li
              key={s.id}
              className={`flex items-center ${idx !== steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                    step > s.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : step === s.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/25 bg-muted/30 text-muted-foreground'
                  }`}
                >
                  {step > s.id ? <Check className="h-3 w-3" /> : s.id}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    step >= s.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.name}
                </span>
              </div>
              {idx !== steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    step > s.id ? 'bg-primary' : 'bg-muted-foreground/25'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form Card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {step === 1 && 'Basic Details'}
              {step === 2 && 'Record Selection'}
              {step === 3 && 'Template Selection'}
              {step === 4 && 'Channel Timing'}
              {step === 5 && 'Review & Confirm'}
            </CardTitle>
            <span className="text-xs text-muted-foreground">Step {step} of 5</span>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 1) {
                setStep(2);
              } else if (step === 2) {
                setStep(3);
              } else if (step === 3) {
                setStep(4);
              } else if (step === 4) {
                if (scheduleMode === 'schedule' && (!scheduledDate || !scheduledTime)) {
                  return;
                }
                setStep(5);
              } else {
                form.handleSubmit();
              }
            }}
            className="space-y-5"
          >
            <div className="mx-auto w-full max-w-5xl space-y-5">
              {/* Step 1: Basic Details */}
              {step === 1 && (
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <form.Field
                      name="name"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value || value.length < 1) return 'Campaign name is required';
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                          <FieldLabel htmlFor={field.name}>
                            Campaign Name <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="Enter campaign name"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                          />
                          <FieldError>
                            {field.state.meta.isTouched && field.state.meta.errors.length > 0
                              ? field.state.meta.errors[0]
                              : null}
                          </FieldError>
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="priority">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value as CampaignPriority)}
                          >
                            <SelectTrigger id={field.name}>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  <form.Field
                    name="description"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.length < 1) return 'Description is required';
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0}>
                        <FieldLabel htmlFor={field.name}>
                          Description <span className="text-destructive">*</span>
                        </FieldLabel>
                        <textarea
                          id={field.name}
                          name={field.name}
                          placeholder="Describe your campaign"
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError>
                          {field.state.meta.isTouched && field.state.meta.errors.length > 0
                            ? field.state.meta.errors[0]
                            : null}
                        </FieldError>
                      </Field>
                    )}
                  </form.Field>
                </div>
              )}

              {/* Step 2: Record Selection */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
                    <Label>
                      Borrower File <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Select value={selectedFile} onValueChange={setSelectedFile}>
                        <SelectTrigger className="w-full sm:max-w-xl">
                          <SelectValue placeholder="Select a file..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mockFiles.map((file) => (
                            <SelectItem key={file.id} value={file.id}>
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{file.name.replace(/\.[^/.]+$/, '')}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({file.records.toLocaleString()} records)
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedFileData && (
                        <span className="text-xs text-muted-foreground">
                          Uploaded: {selectedFileData.uploadDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedFile && (
                    <RecordSelectionTable
                      totalRecords={selectedFileData?.records || 0}
                      selectedRecords={selectedFileData?.records || 0}
                    />
                  )}
                </div>
              )}

              {/* Step 3: Template Selection (Sequence Builder) */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Campaign Sequence</p>
                      <p className="text-xs text-muted-foreground">
                        Add automated messages or manual follow-up steps
                      </p>
                    </div>
                    <Button type="button" onClick={addSequenceStep} variant="outline" size="sm">
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Add Step
                    </Button>
                  </div>

                  {templatesLoading && (
                    <div className="flex items-center gap-2 rounded border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading templates...
                    </div>
                  )}

                  {sequence.map((stepItem, index) => (
                    <Card
                      key={stepItem.id}
                      className="relative overflow-hidden border transition-all hover:border-primary/40"
                    >
                      <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium">Step {index + 1}</span>
                            </div>
                            {sequence.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSequenceStep(stepItem.id)}
                                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Field>
                              <FieldLabel>Channel</FieldLabel>
                              <Select
                                value={stepItem.channel}
                                onValueChange={(val: CampaignSequenceStep['channel']) =>
                                  updateSequenceStep(stepItem.id, {
                                    channel: val,
                                    templateId: '',
                                    manualAction: val === 'manual' ? 'call' : undefined,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="whatsapp">
                                    <div className="flex items-center gap-2">
                                      <Send className="h-4 w-4 text-emerald-600" /> WhatsApp
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="sms">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4 text-green-600" /> SMS
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="email">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-blue-600" /> Email
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="manual">
                                    <div className="flex items-center gap-2">
                                      <UserCog className="h-4 w-4 text-purple-600" /> Manual Step
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>

                            <Field className="lg:col-span-2">
                              {stepItem.channel === 'manual' ? (
                                <>
                                  <FieldLabel>Action Type</FieldLabel>
                                  <Select
                                    value={stepItem.manualAction ?? 'call'}
                                    onValueChange={(val: ManualAction) =>
                                      updateSequenceStep(stepItem.id, { manualAction: val })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select action..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="call">
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-purple-600" /> Phone Call
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="manual_whatsapp">
                                        <div className="flex items-center gap-2">
                                          <Send className="h-4 w-4 text-emerald-600" /> Manual
                                          WhatsApp
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="manual_email">
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-blue-600" /> Manual Email
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="visit">
                                        <div className="flex items-center gap-2">
                                          <UserCog className="h-4 w-4 text-orange-600" /> In-Person
                                          Visit
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </>
                              ) : (
                                <>
                                  <FieldLabel>Template</FieldLabel>
                                  <Select
                                    value={stepItem.templateId}
                                    onValueChange={(val) =>
                                      updateSequenceStep(stepItem.id, { templateId: val })
                                    }
                                    disabled={templatesLoading}
                                  >
                                    <SelectTrigger>
                                      {templatesLoading ? (
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                          <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                                        </span>
                                      ) : (
                                        <SelectValue placeholder="Select template..." />
                                      )}
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(stepItem.channel === 'whatsapp'
                                        ? whatsappTemplates
                                        : stepItem.channel === 'sms'
                                          ? smsTemplates
                                          : emailTemplates
                                      ).map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                          {t.name}
                                        </SelectItem>
                                      ))}
                                      {(stepItem.channel === 'whatsapp'
                                        ? whatsappTemplates
                                        : stepItem.channel === 'sms'
                                          ? smsTemplates
                                          : emailTemplates
                                      ).length === 0 &&
                                        !templatesLoading && (
                                          <SelectItem value="_none" disabled>
                                            No templates - add in Settings
                                          </SelectItem>
                                        )}
                                    </SelectContent>
                                  </Select>
                                </>
                              )}
                            </Field>

                            <Field>
                              <FieldLabel>Delay After Previous</FieldLabel>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={stepItem.delayValue}
                                  onChange={(e) =>
                                    updateSequenceStep(stepItem.id, {
                                      delayValue: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-20"
                                  disabled={index === 0}
                                />
                                <Select
                                  value={stepItem.delayUnit}
                                  onValueChange={(val: any) =>
                                    updateSequenceStep(stepItem.id, { delayUnit: val })
                                  }
                                  disabled={index === 0}
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="minutes">Minutes</SelectItem>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </Field>
                          </div>

                          {index === 0 && (
                            <p className="text-xs text-muted-foreground italic">
                              First step starts immediately or at the scheduled campaign time.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 4: Channel Timing Settings */}
              {step === 4 && (
                <div className="space-y-5">
                  {/* Send Now or Schedule */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Campaign Schedule</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setScheduleMode('now')}
                        className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                          scheduleMode === 'now'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-border hover:border-blue-300'
                        }`}
                      >
                        <Send className="h-4 w-4 shrink-0" />
                        <div className="text-left">
                          <div className="text-sm font-medium">Send Now</div>
                          <div className="text-xs text-muted-foreground">Start immediately</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setScheduleMode('schedule')}
                        className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                          scheduleMode === 'schedule'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-border hover:border-blue-300'
                        }`}
                      >
                        <Clock className="h-4 w-4 shrink-0" />
                        <div className="text-left">
                          <div className="text-sm font-medium">Schedule</div>
                          <div className="text-xs text-muted-foreground">Set date & time</div>
                        </div>
                      </button>
                    </div>

                    {scheduleMode === 'schedule' && (
                      <div className="grid gap-3 pt-1 sm:grid-cols-2">
                        <Field>
                          <FieldLabel>Date</FieldLabel>
                          <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Time</FieldLabel>
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            required
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  {/* Timing Flow Visualizer */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Sequence Timing Flow</p>
                    <div className="rounded-lg border p-3">
                      <div className="flex flex-col gap-2">
                        {sequence.map((stepItem, index) => {
                          const Icon = channelIcon(stepItem.channel);
                          const color = channelColor(stepItem.channel);
                          const isManual = stepItem.channel === 'manual';

                          return (
                            <div key={stepItem.id} className="flex flex-col gap-1">
                              {index > 0 && (
                                <div className="flex items-center gap-3 pl-8">
                                  <div className="relative h-8 w-0.5 bg-border">
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium">
                                      +{stepItem.delayValue} {stepItem.delayUnit}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2">
                                <div
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border bg-white shadow-sm ${color}`}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold capitalize">
                                    {isManual
                                      ? manualActionLabel[stepItem.manualAction ?? 'call']
                                      : stepItem.channel}
                                  </p>
                                  <p className="truncate text-[10px] text-muted-foreground">
                                    {isManual
                                      ? 'Manual - requires agent action'
                                      : `Template: ${getTemplateName(stepItem)}`}
                                  </p>
                                </div>
                                {index === 0 && (
                                  <Badge variant="secondary" className="h-5 text-[10px]">
                                    Start
                                  </Badge>
                                )}
                                {isManual && (
                                  <Badge
                                    variant="outline"
                                    className="h-5 border-purple-300 text-[10px] text-purple-600"
                                  >
                                    Manual
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Campaign Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-semibold">Campaign Summary</p>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Campaign Name</dt>
                          <dd className="text-sm font-medium">{form.getFieldValue('name')}</dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Priority</dt>
                          <dd className="text-sm font-medium capitalize">
                            {form.getFieldValue('priority')}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 sm:col-span-2">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Description</dt>
                          <dd className="text-sm font-medium">
                            {form.getFieldValue('description')}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  {/* Records Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-semibold">Records</p>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Selected File</dt>
                          <dd className="text-sm font-medium">
                            {selectedFileData?.name.replace(/\.[^/.]+$/, '') || 'Not selected'}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Total Records</dt>
                          <dd className="text-sm font-medium">
                            {selectedFileData?.records.toLocaleString() || '0'}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  {/* Sequence Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4 lg:col-span-2">
                    <p className="mb-2 text-sm font-semibold">Sequence</p>
                    <div className="space-y-2">
                      {sequence.map((stepItem, index) => {
                        const Icon = channelIcon(stepItem.channel);
                        const color = channelColor(stepItem.channel);
                        const isManual = stepItem.channel === 'manual';
                        return (
                          <div key={stepItem.id} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border bg-white shadow-sm ${color}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              {index < sequence.length - 1 && (
                                <div className="my-0.5 h-5 w-0.5 bg-border" />
                              )}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-sm font-medium">
                                  {isManual
                                    ? manualActionLabel[stepItem.manualAction ?? 'call']
                                    : stepItem.channel.charAt(0).toUpperCase() +
                                      stepItem.channel.slice(1)}
                                </span>
                                {isManual && (
                                  <Badge
                                    variant="outline"
                                    className="h-4 border-purple-300 text-[10px] text-purple-600"
                                  >
                                    Manual
                                  </Badge>
                                )}
                                {index === 0 ? (
                                  <Badge variant="secondary" className="h-4 text-[10px]">
                                    Start
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    After {stepItem.delayValue} {stepItem.delayUnit}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {isManual
                                  ? 'Manual - requires agent action'
                                  : `Template: ${getTemplateName(stepItem)}`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Schedule Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="mb-2 text-sm font-semibold">Schedule</p>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Start Mode</dt>
                          <dd className="text-sm font-medium">
                            {scheduleMode === 'now' ? 'Send Now (Immediately)' : 'Scheduled'}
                          </dd>
                        </div>
                      </div>
                      {scheduleMode === 'schedule' && (
                        <>
                          <div className="flex items-start gap-2">
                            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                              <dt className="text-xs text-muted-foreground">Scheduled Date</dt>
                              <dd className="text-sm font-medium">
                                {scheduledDate
                                  ? new Date(scheduledDate).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })
                                  : 'Not set'}
                              </dd>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                              <dt className="text-xs text-muted-foreground">Scheduled Time</dt>
                              <dd className="text-sm font-medium">
                                {scheduledTime
                                  ? new Date(`2000-01-01T${scheduledTime}`).toLocaleTimeString(
                                      'en-IN',
                                      { hour: '2-digit', minute: '2-digit', hour12: true },
                                    )
                                  : 'Not set'}
                              </dd>
                            </div>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push('/campaigns/list')}
              >
                Cancel
              </Button>

              <div className="flex gap-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="min-w-32"
                  disabled={
                    (step === 2 && !selectedFile) ||
                    (step === 3 && (!allRequiredTemplatesSelected || !atLeastOneChannelEnabled))
                  }
                >
                  {step === 1 && 'Continue'}
                  {step === 2 && 'Continue'}
                  {step === 3 && 'Continue'}
                  {step === 4 && 'Review Campaign'}
                  {step === 5 && 'Create Campaign'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
