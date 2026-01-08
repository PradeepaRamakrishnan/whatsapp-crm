'use client';

import { useForm } from '@tanstack/react-form';
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
import { templateSchema } from '../lib/template-validation';
import type { TemplateChannel } from '../types/template.types';

const CUSTOMER_VARIABLES = [
  { label: '{{customer_name}}', description: 'Customer full name' },
  { label: '{{outstanding_amount}}', description: 'Outstanding amount' },
  { label: '{{bank_name}}', description: 'Bank name' },
  { label: '{{phone_number}}', description: 'Customer phone number' },
];

const CAMPAIGN_VARIABLES = [
  { label: '{{campaign_name}}', description: 'Campaign name' },
  { label: '{{settlement_offer}}', description: 'Settlement offer details' },
  { label: '{{deadline_date}}', description: 'Offer deadline date' },
];

export function CreateTemplateForm() {
  const router = useRouter();
  const [preview, setPreview] = useState('');

  const form = useForm({
    defaultValues: {
      name: '',
      type: '' as TemplateChannel | '',
      category: '',
      bank: '',
      content: '',
    },
    onSubmit: async ({ value }) => {
      // TODO: integrate API
      console.log('Template submitted:', value);
      router.push('/campaigns/templates');
    },
  });

  // Update preview when content changes
  const handleContentChange = (content: string) => {
    // Replace variables with example values for preview
    let previewText = content;
    previewText = previewText.replace(/\{\{customer_name\}\}/g, 'John Doe');
    previewText = previewText.replace(/\{\{outstanding_amount\}\}/g, '₹50,000');
    previewText = previewText.replace(/\{\{bank_name\}\}/g, 'ICICI Bank');
    previewText = previewText.replace(/\{\{phone_number\}\}/g, '+91 98765 43210');
    previewText = previewText.replace(/\{\{campaign_name\}\}/g, 'January Settlement Campaign');
    previewText = previewText.replace(/\{\{settlement_offer\}\}/g, '40% discount on total amount');
    previewText = previewText.replace(/\{\{deadline_date\}\}/g, 'January 31, 2026');
    setPreview(previewText);
  };

  const insertVariable = (variable: string) => {
    const currentContent = form.getFieldValue('content');
    const newContent = currentContent + (currentContent ? ' ' : '') + variable;
    form.setFieldValue('content', newContent);
    handleContentChange(newContent);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-6"
    >
      {/* Left Side - Form */}
      <div className="flex-1 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Create New Template</h1>
          <p className="text-muted-foreground">
            Create a message template for your communication campaigns
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Enter the basic information for your template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Name */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const result = templateSchema.shape.name.safeParse(value);
                  return result.success ? undefined : result.error.errors[0].message;
                },
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>
                    Template Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Enter template name"
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
              {/* Type */}
              <form.Field name="type">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>
                      Type <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as TemplateChannel)}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              {/* Category */}
              <form.Field name="category">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Reminder">Reminder</SelectItem>
                        <SelectItem value="Settlement">Settlement</SelectItem>
                        <SelectItem value="Bank-specific">Bank-specific</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null}
                    </FieldError>
                  </Field>
                )}
              </form.Field>
            </div>

            {/* Target Bank */}
            <form.Field name="bank">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>Target Bank</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select target bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Banks">All Banks</SelectItem>
                      <SelectItem value="ICICI">ICICI</SelectItem>
                      <SelectItem value="HDFC">HDFC</SelectItem>
                      <SelectItem value="Axis">Axis</SelectItem>
                      <SelectItem value="IndusInd">IndusInd</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError>
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0
                      ? field.state.meta.errors[0]
                      : null}
                  </FieldError>
                </Field>
              )}
            </form.Field>

            {/* Message Content */}
            <form.Field
              name="content"
              validators={{
                onChange: ({ value }) => {
                  const result = templateSchema.shape.content.safeParse(value);
                  return result.success ? undefined : result.error.errors[0].message;
                },
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>
                    Message Content <span className="text-destructive">*</span>
                  </FieldLabel>
                  <textarea
                    id={field.name}
                    name={field.name}
                    placeholder="Enter your message content..."
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      handleContentChange(e.target.value);
                    }}
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
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Template'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>

      {/* Right Side - Variables & Preview */}
      <div className="w-80 space-y-6">
        {/* Variables Section */}
        <Card>
          <CardHeader>
            <CardTitle>Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Variables */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Customer Variables</h4>
              <div className="space-y-2">
                {CUSTOMER_VARIABLES.map((variable) => (
                  <button
                    key={variable.label}
                    type="button"
                    onClick={() => insertVariable(variable.label)}
                    className="flex w-full items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <code className="text-xs font-mono">{variable.label}</code>
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Variables */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Campaign Variables</h4>
              <div className="space-y-2">
                {CAMPAIGN_VARIABLES.map((variable) => (
                  <button
                    key={variable.label}
                    type="button"
                    onClick={() => insertVariable(variable.label)}
                    className="flex w-full items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <code className="text-xs font-mono">{variable.label}</code>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {preview ? (
              <div className="rounded-md border bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm">{preview}</p>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">Preview will appear here</p>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
