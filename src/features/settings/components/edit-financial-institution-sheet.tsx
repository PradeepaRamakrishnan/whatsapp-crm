'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Landmark, Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { createFinancialInstitutionSchema } from '../lib/validation';
import { updateFinancialInstitution } from '../services';
import type { FinancialInstitution } from '../types';

interface EditFinancialInstitutionSheetProps {
  institution: FinancialInstitution | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditFinancialInstitutionSheet({
  institution,
  isOpen,
  onClose,
}: EditFinancialInstitutionSheetProps) {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateFinancialInstitution(institution?.id as string, data),
    onSuccess: () => {
      toast.success('Financial institution updated successfully');
      queryClient.invalidateQueries({ queryKey: ['financial-institutions'] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update financial institution');
    },
  });

  const form = useForm({
    defaultValues: {
      name: institution?.name || '',
      ifscCode: institution?.ifscCode || '',
      branch: institution?.branch || '',
      status: (institution?.status || 'active') as 'active' | 'inactive',
      contactName: institution?.contact.name || '',
      contactEmail: institution?.contact.email || '',
      contactPhone: institution?.contact.phone || '',
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

  useEffect(() => {
    if (institution) {
      form.reset({
        name: institution.name,
        ifscCode: institution.ifscCode,
        branch: institution.branch,
        status: institution.status as 'active' | 'inactive',
        contactName: institution.contact.name,
        contactEmail: institution.contact.email,
        contactPhone: institution.contact.phone,
      });
    }
  }, [institution, form]);

  if (!institution) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md border-l border-slate-200 bg-white p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <Landmark className="h-5 w-5" />
            </div>
            <SheetTitle className="text-xl font-bold text-slate-900">Edit Institution</SheetTitle>
          </div>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-8 p-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Basic Information
            </h3>
            <div className="grid gap-4">
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
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-1.5">
                    <FieldLabel htmlFor={`edit-${field.name}`}>
                      Institution Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id={`edit-${field.name}`}
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
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-1.5">
                    <FieldLabel htmlFor={`edit-${field.name}`}>
                      IFSC Code <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id={`edit-${field.name}`}
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

              <form.Field name="branch">
                {(field) => (
                  <Field className="space-y-1.5">
                    <FieldLabel htmlFor={`edit-${field.name}`}>Branch Name</FieldLabel>
                    <Input
                      id={`edit-${field.name}`}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="status">
                {(field) => (
                  <Field className="space-y-1.5">
                    <FieldLabel htmlFor={`edit-${field.name}`}>Status</FieldLabel>
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

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Primary Contact
            </h3>
            <div className="grid gap-4">
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
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-1.5">
                    <FieldLabel htmlFor={`edit-${field.name}`}>
                      Full Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id={`edit-${field.name}`}
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
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-1.5">
                    <FieldLabel htmlFor={`edit-${field.name}`}>Email Address</FieldLabel>
                    <Input
                      id={`edit-${field.name}`}
                      type="email"
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
                  <Field data-invalid={field.state.meta.errors.length > 0} className="space-y-1.5">
                    <FieldLabel htmlFor={`edit-${field.name}`}>Phone Number</FieldLabel>
                    <Input
                      id={`edit-${field.name}`}
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

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-200">
              Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white min-w-[120px]"
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
