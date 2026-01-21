'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createFinancialInstitutionSchema } from '../lib/validation';
import { createFinancialInstitution } from '../services';

export function CreateFinancialInstitutionForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: createFinancialInstitution,
    onSuccess: () => {
      toast.success('Financial institution created successfully');
      queryClient.invalidateQueries({ queryKey: ['financial-institutions'] });
      router.push('/settings/financial-institutions');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create financial institution');
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      ifscCode: '',
      branch: '',
      status: 'active' as 'active' | 'inactive',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        ifscCode: value.ifscCode,
        branch: value.branch,
        contact: {
          name: value.contactName,
          email: value.contactEmail,
          phone: value.contactPhone,
        },
        status: value.status,
      };

      await mutateAsync(payload);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6"
    >
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add Institution</h1>
        <p className="text-muted-foreground">
          Register a new financial institution or banking partner.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="space-y-8">
          {/* Institution Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) => {
                    const result = createFinancialInstitutionSchema.shape.name.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-2">
                    <FieldLabel htmlFor={field.name}>
                      Institution Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="e.g. HDFC Bank"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
                    />
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="ifscCode"
                validators={{
                  onChange: ({ value }) => {
                    const result = createFinancialInstitutionSchema.shape.ifscCode.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-2">
                    <FieldLabel htmlFor={field.name}>
                      IFSC Code <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="e.g. HDFC0001234"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 font-mono uppercase"
                    />
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="branch"
                validators={{
                  onChange: ({ value }) => {
                    const result = createFinancialInstitutionSchema.shape.branch.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-2">
                    <FieldLabel htmlFor={field.name}>Branch Name</FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="e.g. Mumbai Main Branch"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
                    />
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              <form.Field name="status">
                {(field) => (
                  <Field className="space-y-2">
                    <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val: 'active' | 'inactive') => field.handleChange(val)}
                    >
                      <SelectTrigger className="border-slate-200 focus:border-orange-500 focus:ring-orange-500/20">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Primary Contact Person
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <form.Field
                name="contactName"
                validators={{
                  onChange: ({ value }) => {
                    const result =
                      createFinancialInstitutionSchema.shape.contactName.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-2">
                    <FieldLabel htmlFor={field.name}>
                      Full Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="e.g. John Doe"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
                    />
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="contactEmail"
                validators={{
                  onChange: ({ value }) => {
                    const result =
                      createFinancialInstitutionSchema.shape.contactEmail.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-2">
                    <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="e.g. john.doe@bank.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
                    />
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="contactPhone"
                validators={{
                  onChange: ({ value }) => {
                    const result =
                      createFinancialInstitutionSchema.shape.contactPhone.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-2">
                    <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="e.g. +91 9876543210"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
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
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-slate-200 hover:bg-slate-50 text-slate-600"
        >
          Cancel
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || isPending}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20 transition-all"
            >
              {isSubmitting || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Institution
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
