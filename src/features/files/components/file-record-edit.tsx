'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { updateFileRecord } from '../services';
import type { FileRecord } from '../types/file.types';

const recordSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  emailId: z.string().email('Invalid email address').or(z.literal('')),
  mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
  settlementAmount: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Amount must be a positive number'),
  ),
});

interface FileRecordEditProps {
  fileId: string;
  record: FileRecord | null;
  onOpenChange: (open: boolean) => void;
}

export function FileRecordEdit({ fileId, record, onOpenChange }: FileRecordEditProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof recordSchema>) => {
      if (!record) throw new Error('No record selected');
      return updateFileRecord(fileId, record.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file', fileId] });
      toast.success('Record updated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update record');
    },
  });

  const form = useForm({
    defaultValues: {
      customerName: record?.customerName || '',
      emailId: record?.emailId || '',
      mobileNumber: record?.mobileNumber || '',
      settlementAmount: record?.settlementAmount || 0,
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  return (
    <Sheet open={!!record} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-xl font-bold tracking-tight">Edit Customer Record</SheetTitle>
          <SheetDescription className="text-sm">
            Make changes to the customer information below. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="customerName"
            validators={{
              onChange: ({ value }) => {
                const result = recordSchema.shape.customerName.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor="customerName" className="text-sm font-semibold mb-1.5">
                  Customer Name
                </FieldLabel>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="h-10"
                />
                <FieldError>{field.state.meta.errors[0]}</FieldError>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="emailId"
            validators={{
              onChange: ({ value }) => {
                const result = recordSchema.shape.emailId.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor="emailId" className="text-sm font-semibold mb-1.5">
                  Email Address
                </FieldLabel>
                <Input
                  id="emailId"
                  placeholder="Enter email address"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="h-10"
                />
                <FieldError>{field.state.meta.errors[0]}</FieldError>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="mobileNumber"
            validators={{
              onChange: ({ value }) => {
                const result = recordSchema.shape.mobileNumber.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor="mobileNumber" className="text-sm font-semibold mb-1.5">
                  Mobile Number
                </FieldLabel>
                <Input
                  id="mobileNumber"
                  placeholder="Enter mobile number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="h-10"
                />
                <FieldError>{field.state.meta.errors[0]}</FieldError>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="settlementAmount"
            validators={{
              onChange: ({ value }) => {
                const result = recordSchema.shape.settlementAmount.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor="settlementAmount" className="text-sm font-semibold mb-1.5">
                  Settlement Amount
                </FieldLabel>
                <Input
                  id="settlementAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  onBlur={field.handleBlur}
                  className="h-10"
                />
                <FieldError>{field.state.meta.errors[0]}</FieldError>
              </Field>
            )}
          </form.Field>

          <div className="flex justify-end gap-3 pt-6  mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || updateMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
                >
                  {(isSubmitting || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
