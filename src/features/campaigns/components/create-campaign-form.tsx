'use client';

import { useForm } from '@tanstack/react-form';
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileSpreadsheet,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Send,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RecordSelectionTable } from './record-selection-table';

type CampaignPriority = 'low' | 'medium' | 'high' | 'urgent';

const steps = [
  { id: 1, name: 'Basic Details', description: 'Campaign information' },
  { id: 2, name: 'Record Selection', description: 'Select borrowers' },
  { id: 3, name: 'Template Selection', description: 'Choose templates' },
  { id: 4, name: 'Channel Timing', description: 'Set delays' },
  { id: 5, name: 'Review & Confirm', description: 'Verify details' },
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
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [smsEnabled, setSmsEnabled] = useState<boolean>(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
  const [emailTemplate, setEmailTemplate] = useState<string>('');
  const [smsTemplate, setSmsTemplate] = useState<string>('');
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('');
  const [channelOrder, setChannelOrder] = useState<('email' | 'sms' | 'whatsapp')[]>([
    'email',
    'sms',
    'whatsapp',
  ]);
  const [smsDelay, setSmsDelay] = useState<string>('30');
  const [whatsappDelay, setWhatsappDelay] = useState<string>('60');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');

  const swapChannels = (index1: number, index2: number) => {
    // Email is always first (index 0), only allow swapping SMS and WhatsApp
    if (index1 === 0 || index2 === 0) return;
    const newOrder = [...channelOrder];
    [newOrder[index1], newOrder[index2]] = [newOrder[index2], newOrder[index1]];
    setChannelOrder(newOrder);
  };

  const form = useForm({
    defaultValues: {
      name: '',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      description: '',
    },
    onSubmit: async () => {
      // TODO: integrate API
      router.push('/campaigns/list');
    },
  });

  // TODO: Replace with actual template API calls
  const emailTemplates: any[] = [];
  const smsTemplates: any[] = [];
  const whatsappTemplates: any[] = [];

  const selectedEmailData = undefined as any;
  const selectedSmsData = undefined as any;
  const selectedWhatsappData = undefined as any;
  const selectedFileData = mockFiles.find((f) => f.id === selectedFile);

  const allRequiredTemplatesSelected =
    (!emailEnabled || emailTemplate) &&
    (!smsEnabled || smsTemplate) &&
    (!whatsappEnabled || whatsappTemplate);

  const atLeastOneChannelEnabled = emailEnabled || smsEnabled || whatsappEnabled;

  return (
    <div className="flex w-full flex-1 flex-col gap-8 p-6">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
        <p className="text-muted-foreground">
          Set up your campaign by providing basic details and uploading the borrowers list
        </p>
      </div>

      {/* Stepper */}
      <nav aria-label="Progress" className="pb-2">
        <ol className="flex items-center">
          {steps.map((s, idx) => (
            <li
              key={s.id}
              className={`flex items-center ${idx !== steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm transition-all ${
                      step > s.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : step === s.id
                          ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
                          : 'border-muted-foreground/25 bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    {step > s.id ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-lg font-semibold">{s.id}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${
                        step >= s.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {s.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{s.description}</span>
                  </div>
                </div>
              </div>
              {idx !== steps.length - 1 && (
                <div
                  className={`mx-6 h-0.5 flex-1 transition-colors ${
                    step > s.id ? 'bg-primary' : 'bg-muted-foreground/25'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form Content */}
      <Card className="shadow-md">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-2xl">
            {step === 1 && 'Basic Details'}
            {step === 2 && 'Record Selection'}
            {step === 3 && 'Template Selection'}
            {step === 4 && 'Channel Timing Settings'}
            {step === 5 && 'Review & Confirm'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Provide the essential information about your campaign'}
            {step === 2 && 'Choose a file and view selected borrowers'}
            {step === 3 && 'Select a communication template for this campaign'}
            {step === 4 && 'Set delays between message channels'}
            {step === 5 && 'Review all information before creating the campaign'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
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
                // Validate schedule fields if schedule mode is selected
                if (scheduleMode === 'schedule' && (!scheduledDate || !scheduledTime)) {
                  // Show validation error - fields are required
                  return;
                }
                setStep(5);
              } else {
                form.handleSubmit();
              }
            }}
            className="space-y-6"
          >
            {/* Step 1: Basic Details */}
            {step === 1 && (
              <div className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <form.Field
                    name="name"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.length < 1) {
                          return 'Campaign name is required';
                        }
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
                      if (!value || value.length < 1) {
                        return 'Description is required';
                      }
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
                        className="flex min-h-30 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="space-y-6">
                {/* File Selection */}
                <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-blue-100/50 dark:border-blue-800 dark:from-blue-950/30 dark:to-blue-900/20">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-blue-500 p-3">
                        <FileSpreadsheet className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                          Select Borrower File
                        </h3>
                        <p className="mb-4 text-lg font-semibold">
                          Choose a file containing borrower records
                        </p>
                        <div className="max-w-md">
                          <Select value={selectedFile} onValueChange={setSelectedFile}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select a file..." />
                            </SelectTrigger>
                            <SelectContent>
                              {mockFiles.map((file) => (
                                <SelectItem key={file.id} value={file.id}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {file.name.replace(/\.[^/.]+$/, '')}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ({file.records.toLocaleString()} records)
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedFileData && (
                          <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
                            <span>Records: {selectedFileData.records.toLocaleString()}</span>
                            <span>Uploaded: {selectedFileData.uploadDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Show records table only if file is selected */}
                {selectedFile && (
                  <RecordSelectionTable
                    totalRecords={selectedFileData?.records || 0}
                    selectedRecords={selectedFileData?.records || 0}
                  />
                )}
              </div>
            )}

            {/* Step 3: Template Selection */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Select Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable channels and choose templates for your campaign
                  </p>
                </div>

                {!atLeastOneChannelEnabled && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                    <div className="flex gap-3">
                      <div className="rounded-full bg-amber-500 p-1 h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                          No channels enabled
                        </p>
                        <p className="text-amber-800 dark:text-amber-300">
                          Please enable at least one communication channel to continue with your
                          campaign.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Templates */}
                <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-blue-100/50 dark:border-blue-800 dark:from-blue-950/30 dark:to-blue-900/20">
                  <div className={emailEnabled ? 'p-6' : 'p-4'}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-600 p-2.5 shrink-0">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold">Email Template</h4>
                          {emailEnabled && (
                            <Badge variant="secondary" className="text-xs">
                              Enabled
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Enable Channel</span>
                        <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                      </div>
                    </div>

                    {emailEnabled && (
                      <div className="mt-4 space-y-4">
                        <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue placeholder="Select email template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {emailTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium">{template.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">
                                        {template.bankTag}
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">
                                        {template.tags?.join(', ')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedEmailData && (
                          <div className="rounded-lg border bg-background p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-semibold">Email Preview</span>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                                <p className="text-sm font-medium">
                                  {typeof selectedEmailData.content === 'object'
                                    ? selectedEmailData.content.subject
                                    : selectedEmailData.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Content:</p>
                                <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                  {typeof selectedEmailData.content === 'object'
                                    ? selectedEmailData.content.body
                                    : selectedEmailData.content}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t">
                                <span>Created: {selectedEmailData.createdAt}</span>
                                <span>•</span>
                                <span>By: {selectedEmailData.modifiedBy}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {selectedEmailData.bankTag}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* SMS Templates */}
                <Card className="border-green-200 bg-linear-to-br from-green-50 to-green-100/50 dark:border-green-800 dark:from-green-950/30 dark:to-green-900/20">
                  <div className={smsEnabled ? 'p-6' : 'p-4'}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-600 p-2.5 shrink-0">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold">SMS Template</h4>
                          {smsEnabled && (
                            <Badge variant="secondary" className="text-xs">
                              Enabled
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                    </div>

                    {smsEnabled && (
                      <div className="mt-4 space-y-4">
                        <Select value={smsTemplate} onValueChange={setSmsTemplate}>
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue placeholder="Select SMS template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {smsTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium">{template.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">
                                        {template.bankTag}
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">
                                        {template.tags?.join(', ')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedSmsData && (
                          <div className="rounded-md border bg-background p-4">
                            <p className="text-sm leading-relaxed">
                              {typeof selectedSmsData.content === 'string'
                                ? selectedSmsData.content
                                : selectedSmsData.content.body}
                            </p>
                            <div className="mt-3 flex flex-col gap-1 pt-3 border-t text-xs text-muted-foreground">
                              <span>Created: {selectedSmsData.createdAt}</span>
                              <span>By: {selectedSmsData.modifiedBy}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* WhatsApp Templates */}
                <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-emerald-900/20">
                  <div className={whatsappEnabled ? 'p-6' : 'p-4'}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-600 p-2.5 shrink-0">
                          <Send className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold">WhatsApp Template</h4>
                          {whatsappEnabled && (
                            <Badge variant="secondary" className="text-xs">
                              Enabled
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                    </div>

                    {whatsappEnabled && (
                      <div className="mt-4 space-y-4">
                        <Select value={whatsappTemplate} onValueChange={setWhatsappTemplate}>
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue placeholder="Select WhatsApp template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {whatsappTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium">{template.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">
                                        {template.bankTag}
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">
                                        {template.tags?.join(', ')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedWhatsappData && (
                          <div className="rounded-md border bg-background p-4">
                            <p className="text-sm leading-relaxed">
                              {typeof selectedWhatsappData.content === 'string'
                                ? selectedWhatsappData.content
                                : selectedWhatsappData.content.body}
                            </p>
                            <div className="mt-3 flex flex-col gap-1 pt-3 border-t text-xs text-muted-foreground">
                              <span>Created: {selectedWhatsappData.createdAt}</span>
                              <span>By: {selectedWhatsappData.modifiedBy}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Step 4: Channel Timing Settings */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Header with Icon */}
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-blue-500 p-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Channel Timing Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Set delays between enabled communication channels
                    </p>
                  </div>
                </div>

                {/* Send Now or Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campaign Schedule</CardTitle>
                    <CardDescription>Choose when to send the campaign</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Toggle between Send Now and Schedule */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setScheduleMode('now')}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                          scheduleMode === 'now'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-border hover:border-blue-300 dark:hover:border-blue-800'
                        }`}
                      >
                        <Send className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold text-sm">Send Now</div>
                          <div className="text-xs text-muted-foreground">Start immediately</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setScheduleMode('schedule')}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                          scheduleMode === 'schedule'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-border hover:border-blue-300 dark:hover:border-blue-800'
                        }`}
                      >
                        <Clock className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold text-sm">Schedule</div>
                          <div className="text-xs text-muted-foreground">Set date & time</div>
                        </div>
                      </button>
                    </div>

                    {/* Date and Time Picker - shown when Schedule is selected */}
                    {scheduleMode === 'schedule' && (
                      <div className="grid gap-4 sm:grid-cols-2 pt-2">
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
                  </CardContent>
                </Card>

                {/* Timing Flow */}
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-4">
                      {channelOrder.map((channel, index) => {
                        const isFirst = index === 0;
                        const isLast = index === channelOrder.length - 1;
                        const channelConfig = {
                          email: {
                            icon: Mail,
                            label: 'Email',
                            colors:
                              'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
                            iconColor: 'text-blue-600',
                          },
                          sms: {
                            icon: MessageSquare,
                            label: 'SMS',
                            colors:
                              'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30',
                            iconColor: 'text-green-600',
                            delay: smsDelay,
                            setDelay: setSmsDelay,
                          },
                          whatsapp: {
                            icon: Send,
                            label: 'WhatsApp',
                            colors:
                              'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
                            iconColor: 'text-emerald-600',
                            delay: whatsappDelay,
                            setDelay: setWhatsappDelay,
                          },
                        };

                        const config = channelConfig[channel];
                        const Icon = config.icon;

                        return (
                          <>
                            <div
                              key={channel}
                              className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 ${config.colors}`}
                            >
                              <Icon className={`h-5 w-5 ${config.iconColor}`} />
                              <div>
                                <div className="font-semibold text-sm">{config.label}</div>
                                {isFirst && (
                                  <div className="text-xs text-muted-foreground">(Start)</div>
                                )}
                              </div>
                              {/* Only show swap buttons for SMS and WhatsApp (not Email) */}
                              {!isFirst && (
                                <div className="flex flex-col gap-1 ml-2">
                                  {index > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => swapChannels(index, index - 1)}
                                      className="hover:bg-black/5 dark:hover:bg-white/5 rounded p-0.5"
                                    >
                                      <ChevronUp className="h-3 w-3" />
                                    </button>
                                  )}
                                  {!isLast && (
                                    <button
                                      type="button"
                                      onClick={() => swapChannels(index, index + 1)}
                                      className="hover:bg-black/5 dark:hover:bg-white/5 rounded p-0.5"
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {!isFirst && 'delay' in config && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={config.delay}
                                  onChange={(e) => config.setDelay?.(e.target.value)}
                                  className="h-10 w-20 text-center"
                                />
                                <span className="text-sm text-muted-foreground">min</span>
                              </div>
                            )}

                            {index < channelOrder.length - 1 && (
                              <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </>
                        );
                      })}

                      <ArrowRight className="h-5 w-5 text-muted-foreground" />

                      {/* Call Follow-up */}
                      <div className="flex items-center gap-3 rounded-lg border-2 border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-950/30">
                        <Phone className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="font-semibold text-sm">Call Follow-up</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="rounded-full bg-blue-500 p-1 h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">How it works:</p>
                        <ul className="space-y-1 text-xs">
                          {emailEnabled && <li>• Campaign starts with Email communication</li>}
                          {!emailEnabled && smsEnabled && (
                            <li>• Campaign starts with SMS communication</li>
                          )}
                          {!emailEnabled && !smsEnabled && whatsappEnabled && (
                            <li>• Campaign starts with WhatsApp communication</li>
                          )}
                          {emailEnabled && smsEnabled && (
                            <li>• After {smsDelay} minutes, SMS will be sent to recipients</li>
                          )}
                          {smsEnabled && whatsappEnabled && (
                            <li>
                              • After {whatsappDelay} minutes from {emailEnabled ? 'SMS' : 'start'},
                              WhatsApp message will be sent
                            </li>
                          )}
                          {emailEnabled && !smsEnabled && whatsappEnabled && (
                            <li>• After {whatsappDelay} minutes, WhatsApp message will be sent</li>
                          )}
                          <li>
                            • Call follow-up will be scheduled after all automated communications
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-6">
                {/* Campaign Summary */}
                <div className="rounded-lg border bg-muted/30 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Campaign Summary</h3>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <dt className="text-xs font-medium text-muted-foreground">Campaign Name</dt>
                        <dd className="text-sm font-medium">{form.getFieldValue('name')}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <dt className="text-xs font-medium text-muted-foreground">Priority</dt>
                        <dd className="text-sm font-medium capitalize">
                          {form.getFieldValue('priority')}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <dt className="text-xs font-medium text-muted-foreground">Description</dt>
                        <dd className="text-sm font-medium">{form.getFieldValue('description')}</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Records Summary */}
                <div className="rounded-lg border bg-muted/30 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Records Summary</h3>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <dt className="text-xs font-medium text-muted-foreground">Selected File</dt>
                        <dd className="text-sm font-medium">
                          {selectedFileData?.name.replace(/\.[^/.]+$/, '') || 'Not selected'}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <dt className="text-xs font-medium text-muted-foreground">Total Records</dt>
                        <dd className="text-sm font-medium">
                          {selectedFileData?.records.toLocaleString() || '0'}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Template Summary */}
                <div className="rounded-lg border bg-muted/30 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Template Summary</h3>
                  <div className="space-y-3">
                    {/* Email Template */}
                    {emailEnabled && (
                      <div className="flex items-start gap-3 rounded-lg border p-3">
                        <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            Email Template
                          </div>
                          <div className="text-sm font-medium mt-0.5">
                            {selectedEmailData?.name || 'Not selected'}
                          </div>
                          {selectedEmailData && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {selectedEmailData.bankTag}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SMS Template */}
                    {smsEnabled && (
                      <div className="flex items-start gap-3 rounded-lg border p-3">
                        <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            SMS Template
                          </div>
                          <div className="text-sm font-medium mt-0.5">
                            {selectedSmsData?.name || 'Not selected'}
                          </div>
                          {selectedSmsData && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {selectedSmsData.bankTag}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Template */}
                    {whatsappEnabled && (
                      <div className="flex items-start gap-3 rounded-lg border p-3">
                        <Send className="h-5 w-5 text-emerald-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            WhatsApp Template
                          </div>
                          <div className="text-sm font-medium mt-0.5">
                            {selectedWhatsappData?.name || 'Not selected'}
                          </div>
                          {selectedWhatsappData && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {selectedWhatsappData.bankTag}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Summary */}
                <div className="rounded-lg border bg-muted/30 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Campaign Schedule</h3>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <dt className="text-xs font-medium text-muted-foreground">Start Mode</dt>
                        <dd className="text-sm font-medium capitalize">
                          {scheduleMode === 'now' ? 'Send Now (Immediately)' : 'Scheduled'}
                        </dd>
                      </div>
                    </div>
                    {scheduleMode === 'schedule' && (
                      <>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <dt className="text-xs font-medium text-muted-foreground">
                              Scheduled Date
                            </dt>
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
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <dt className="text-xs font-medium text-muted-foreground">
                              Scheduled Time
                            </dt>
                            <dd className="text-sm font-medium">
                              {scheduledTime
                                ? new Date(`2000-01-01T${scheduledTime}`).toLocaleTimeString(
                                    'en-IN',
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
                                    },
                                  )
                                : 'Not set'}
                            </dd>
                          </div>
                        </div>
                      </>
                    )}
                  </dl>
                </div>

                {/* Channel Timing Summary */}
                <div className="rounded-lg border bg-muted/30 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Channel Timing</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {emailEnabled && (
                      <>
                        <div className="flex items-center gap-2 rounded-lg border bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Email</span>
                          <Badge variant="secondary" className="text-xs">
                            Start
                          </Badge>
                        </div>
                        {(smsEnabled || whatsappEnabled) && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </>
                    )}
                    {smsEnabled && (
                      <>
                        <div className="flex items-center gap-2 rounded-lg border bg-green-50 px-3 py-2 dark:bg-green-950/30">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">SMS</span>
                          {emailEnabled ? (
                            <Badge variant="outline" className="text-xs">
                              {smsDelay} min
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Start
                            </Badge>
                          )}
                        </div>
                        {whatsappEnabled && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </>
                    )}
                    {whatsappEnabled && (
                      <>
                        <div className="flex items-center gap-2 rounded-lg border bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
                          <Send className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">WhatsApp</span>
                          {emailEnabled || smsEnabled ? (
                            <Badge variant="outline" className="text-xs">
                              {whatsappDelay} min
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Start
                            </Badge>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </>
                    )}
                    <div className="flex items-center gap-2 rounded-lg border bg-purple-50 px-3 py-2 dark:bg-purple-950/30">
                      <Phone className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Call</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 border-t pt-6 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/campaigns/list')}
              >
                Cancel
              </Button>

              <div className="flex gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="min-w-35"
                  disabled={
                    (step === 2 && !selectedFile) ||
                    (step === 3 && (!allRequiredTemplatesSelected || !atLeastOneChannelEnabled))
                  }
                >
                  {step === 1 && 'Continue'}
                  {step === 2 && 'Continue to Templates'}
                  {step === 3 && 'Continue to Timing'}
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
