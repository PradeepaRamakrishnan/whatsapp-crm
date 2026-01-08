'use client';

import { useForm } from '@tanstack/react-form';
import {
  ArrowRight,
  Check,
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
import { mockTemplates } from '../lib/templates-data';
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
  const [emailTemplate, setEmailTemplate] = useState<string>('');
  const [smsTemplate, setSmsTemplate] = useState<string>('');
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('');
  const [smsDelay, setSmsDelay] = useState<string>('30');
  const [whatsappDelay, setWhatsappDelay] = useState<string>('60');

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

  const emailTemplates = mockTemplates.filter(
    (t) => t.status === 'approved' && t.channel === 'email',
  );
  const smsTemplates = mockTemplates.filter((t) => t.status === 'approved' && t.channel === 'sms');
  const whatsappTemplates = mockTemplates.filter(
    (t) => t.status === 'approved' && t.channel === 'whatsapp',
  );

  const selectedEmailData = mockTemplates.find((t) => t.id === emailTemplate);
  const selectedSmsData = mockTemplates.find((t) => t.id === smsTemplate);
  const selectedWhatsappData = mockTemplates.find((t) => t.id === whatsappTemplate);
  const selectedFileData = mockFiles.find((f) => f.id === selectedFile);

  const allTemplatesSelected = emailTemplate && smsTemplate && whatsappTemplate;

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
                                    <span className="font-medium">{file.name}</span>
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
                    Choose one template from each category for your campaign
                  </p>
                </div>

                {/* Email Templates */}
                <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-blue-100/50 dark:border-blue-800 dark:from-blue-950/30 dark:to-blue-900/20">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-blue-600 p-2.5">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Email Template</h4>
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        </div>
                        <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue placeholder="Select email template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {emailTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium">{template.title}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">
                                        {template.bankTag}
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">
                                        {template.typeTag}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedEmailData && (
                          <div className="rounded-md border bg-background p-3">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {selectedEmailData.content}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Modified: {selectedEmailData.modifiedDate}</span>
                              <span>By: {selectedEmailData.modifiedBy}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* SMS Templates */}
                <Card className="border-green-200 bg-linear-to-br from-green-50 to-green-100/50 dark:border-green-800 dark:from-green-950/30 dark:to-green-900/20">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-green-600 p-2.5">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">SMS Template</h4>
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        </div>
                        <Select value={smsTemplate} onValueChange={setSmsTemplate}>
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue placeholder="Select SMS template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {smsTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium">{template.title}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">
                                        {template.bankTag}
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">
                                        {template.typeTag}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedSmsData && (
                          <div className="rounded-md border bg-background p-3">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {selectedSmsData.content}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Modified: {selectedSmsData.modifiedDate}</span>
                              <span>By: {selectedSmsData.modifiedBy}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* WhatsApp Templates */}
                <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-emerald-900/20">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-emerald-600 p-2.5">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">WhatsApp Template</h4>
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        </div>
                        <Select value={whatsappTemplate} onValueChange={setWhatsappTemplate}>
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue placeholder="Select WhatsApp template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {whatsappTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium">{template.title}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">
                                        {template.bankTag}
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">
                                        {template.typeTag}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedWhatsappData && (
                          <div className="rounded-md border bg-background p-3">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {selectedWhatsappData.content}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Modified: {selectedWhatsappData.modifiedDate}</span>
                              <span>By: {selectedWhatsappData.modifiedBy}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
                      Set delays between message channels
                    </p>
                  </div>
                </div>

                {/* Timing Flow */}
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Email (Start) */}
                      <div className="flex items-center gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-semibold text-sm">Email</div>
                          <div className="text-xs text-muted-foreground">(Start)</div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />

                      {/* SMS with delay input */}
                      <div className="flex items-center gap-3 rounded-lg border-2 border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950/30">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-semibold text-sm">SMS</div>
                          </div>
                        </div>
                      </div>

                      {/* Delay input for SMS */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={smsDelay}
                          onChange={(e) => setSmsDelay(e.target.value)}
                          className="h-10 w-20 text-center"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />

                      {/* WhatsApp with delay input */}
                      <div className="flex items-center gap-3 rounded-lg border-2 border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                        <Send className="h-5 w-5 text-emerald-600" />
                        <div>
                          <div className="font-semibold text-sm">WhatsApp</div>
                        </div>
                      </div>

                      {/* Delay input for WhatsApp */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={whatsappDelay}
                          onChange={(e) => setWhatsappDelay(e.target.value)}
                          className="h-10 w-20 text-center"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>

                      {/* Arrow */}
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
                          <li>• Campaign starts with Email communication</li>
                          <li>• After {smsDelay} minutes, SMS will be sent to recipients</li>
                          <li>
                            • After {whatsappDelay} minutes from SMS, WhatsApp message will be sent
                          </li>
                          <li>• Call follow-up will be scheduled after WhatsApp communication</li>
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
                          {selectedFileData?.name || 'Not selected'}
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
                    <div className="flex items-start gap-3 rounded-lg border p-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          Email Template
                        </div>
                        <div className="text-sm font-medium mt-0.5">
                          {selectedEmailData?.title || 'Not selected'}
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

                    {/* SMS Template */}
                    <div className="flex items-start gap-3 rounded-lg border p-3">
                      <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          SMS Template
                        </div>
                        <div className="text-sm font-medium mt-0.5">
                          {selectedSmsData?.title || 'Not selected'}
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

                    {/* WhatsApp Template */}
                    <div className="flex items-start gap-3 rounded-lg border p-3">
                      <Send className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          WhatsApp Template
                        </div>
                        <div className="text-sm font-medium mt-0.5">
                          {selectedWhatsappData?.title || 'Not selected'}
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
                  </div>
                </div>

                {/* Channel Timing Summary */}
                <div className="rounded-lg border bg-muted/30 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Channel Timing</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Email</span>
                      <Badge variant="secondary" className="text-xs">
                        Start
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2 rounded-lg border bg-green-50 px-3 py-2 dark:bg-green-950/30">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">SMS</span>
                      <Badge variant="outline" className="text-xs">
                        {smsDelay} min
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2 rounded-lg border bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
                      <Send className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium">WhatsApp</span>
                      <Badge variant="outline" className="text-xs">
                        {whatsappDelay} min
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
                  disabled={(step === 2 && !selectedFile) || (step === 3 && !allTemplatesSelected)}
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
