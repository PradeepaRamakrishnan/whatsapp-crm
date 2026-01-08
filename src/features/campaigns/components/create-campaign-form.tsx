'use client';

import { useForm } from '@tanstack/react-form';
import { AlertCircle, Calendar, Check, FileText, Loader2, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { validateBorrowersFile } from '../lib/mock-validation';
import { campaignSchema, type FileValidationResult } from '../lib/validation';
import { BorrowersFileUpload } from './borrowers-file-upload';

type CampaignStatus = 'Draft' | 'Scheduled' | 'Active';

const steps = [
  { id: 1, name: 'Basic Details', description: 'Campaign information' },
  { id: 2, name: 'Upload Borrowers', description: 'Import borrowers list' },
  { id: 3, name: 'Review & Confirm', description: 'Verify details' },
];

export function CreateCampaignForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      status: 'Draft' as CampaignStatus,
      scheduledDate: '',
      responseRate: 0,
      borrowersFile: null as File | null,
      validationResult: null as FileValidationResult | null,
    },
    onSubmit: async () => {
      // TODO: integrate API
      router.push('/campaigns/list');
    },
  });

  const handleFileChange = async (file: File | null) => {
    form.setFieldValue('borrowersFile', file);
    form.setFieldValue('validationResult', null);

    if (file) {
      setIsValidating(true);
      try {
        const result = await validateBorrowersFile(file);
        form.setFieldValue('validationResult', result);
      } finally {
        setIsValidating(false);
      }
    }
  };

  const canProceedToStep3 = () => {
    const file = form.getFieldValue('borrowersFile');
    const validationResult = form.getFieldValue('validationResult');
    return file && validationResult?.isValid;
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
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
            {step === 1 && 'Campaign Basic Details'}
            {step === 2 && 'Upload Borrowers List'}
            {step === 3 && 'Review & Confirm'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Provide the essential information about your campaign'}
            {step === 2 && 'Upload a CSV or Excel file containing your borrowers data'}
            {step === 3 && 'Review all information before creating the campaign'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 1) {
                setStep(2);
              } else if (step === 2) {
                if (canProceedToStep3()) {
                  setStep(3);
                }
              } else {
                form.handleSubmit();
              }
            }}
            className="space-y-6"
          >
            {/* Step 1: Basic Details */}
            {step === 1 && (
              <div className="grid gap-6">
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      const result = campaignSchema.shape.name.safeParse(value);
                      return result.success ? undefined : result.error.errors[0].message;
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

                <div className="grid gap-6 sm:grid-cols-2">
                  <form.Field name="status">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(v) => field.handleChange(v as CampaignStatus)}
                        >
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="scheduledDate">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Scheduled Date</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="date"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </Field>
                    )}
                  </form.Field>
                </div>

                <form.Field name="responseRate">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Expected Response Rate (%)</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="0.0"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                      />
                      <p className="text-xs text-muted-foreground">
                        Expected response rate for this campaign
                      </p>
                    </Field>
                  )}
                </form.Field>
              </div>
            )}

            {/* Step 2: Upload File */}
            {step === 2 && (
              <div className="space-y-6">
                <BorrowersFileUpload
                  file={form.getFieldValue('borrowersFile')}
                  onFileChange={handleFileChange}
                  validationResult={form.getFieldValue('validationResult')}
                />

                {isValidating && (
                  <div className="flex items-center justify-center gap-3 rounded-lg border bg-muted/30 p-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm font-medium">Validating file...</p>
                  </div>
                )}

                {!canProceedToStep3() && form.getFieldValue('validationResult') && (
                  <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                        Cannot proceed with invalid data
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Please fix the validation errors or upload a corrected file to continue.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Campaign Summary */}
                <div className="rounded-lg border bg-muted/30 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Campaign Summary</h3>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Campaign Name</dt>
                        <dd className="text-sm font-medium">{form.getFieldValue('name')}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                        <dd className="text-sm font-medium">{form.getFieldValue('status')}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Scheduled Date
                        </dt>
                        <dd className="text-sm font-medium">
                          {form.getFieldValue('scheduledDate') || 'Not set'}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Response Rate</dt>
                        <dd className="text-sm font-medium">
                          {form.getFieldValue('responseRate')}%
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* File Summary */}
                <div className="rounded-lg border bg-muted/30 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Borrowers File</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {form.getFieldValue('borrowersFile')?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((form.getFieldValue('borrowersFile')?.size ?? 0) / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Validated
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 rounded-lg border bg-background p-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Rows</p>
                        <p className="text-lg font-semibold">
                          {form.getFieldValue('validationResult')?.totalRows}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valid Rows</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {form.getFieldValue('validationResult')?.validRows}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Invalid Rows</p>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {form.getFieldValue('validationResult')?.invalidRows}
                        </p>
                      </div>
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
                    onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={(step === 2 && !canProceedToStep3()) || isValidating}
                  className="min-w-[140px]"
                >
                  {step === 1 && 'Continue'}
                  {step === 2 && 'Review Campaign'}
                  {step === 3 && 'Create Campaign'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
