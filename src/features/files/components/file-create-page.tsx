'use client';

import { useForm } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
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
import { getAllFinancialInstitutionsName } from '@/features/settings/services';
import { cn } from '@/lib/utils';
import { fileUploadSchema } from '../lib/validation';
import { createFile } from '../services';

export function FileCreatePage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const queryClient = useQueryClient();

  const { data: banksResponse } = useQuery({
    queryKey: ['financial-institutions-names'],
    queryFn: () => getAllFinancialInstitutionsName(),
  });

  const form = useForm({
    defaultValues: {
      files: [] as File[],
      bank: '',
      customFileName: '',
    },
    onSubmit: async ({ value }) => {
      try {
        if (!value.files || value.files.length === 0) {
          toast.error('Please select at least one file');
          return;
        }

        const formData = new FormData();
        value.files.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('bankName', value.bank);
        formData.append('name', value.customFileName);

        toast.loading('Uploading files...', { id: 'file-upload' });
        await createFile(formData);
        await queryClient.invalidateQueries({ queryKey: ['files'] });
        toast.success('Files uploaded successfully!', { id: 'file-upload' });

        router.push('/files/list');
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, { id: 'file-upload' });
        } else {
          toast.error('Failed to upload files', { id: 'file-upload' });
        }
        console.error(error);
      }
    },
  });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, fieldHandleChange: (files: File[]) => void, currentFiles: File[]) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        fieldHandleChange([...currentFiles, ...droppedFiles]);
      }
    },
    [],
  );

  const removeFile = (
    indexToRemove: number,
    currentFiles: File[],
    fieldHandleChange: (files: File[]) => void,
  ) => {
    const newFiles = currentFiles.filter((_, index) => index !== indexToRemove);
    fieldHandleChange(newFiles);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Card className="shadow-md">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-2xl">File Upload</CardTitle>
            <CardDescription>Upload CSV files containing your borrowers data</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* File Upload Configuration */}
              <div>
                <h3 className="mb-4 text-lg font-semibold">File Upload Configuration</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field
                    name="bank"
                    validators={{
                      onChange: ({ value }) => {
                        const result = fileUploadSchema.shape.bank.safeParse(value);
                        return result.success ? undefined : result.error.errors[0].message;
                      },
                    }}
                  >
                    {(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0}>
                        <FieldLabel htmlFor="select-bank">Select Bank</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(val) => field.handleChange(val)}
                          disabled={!banksResponse?.data || banksResponse.data.length === 0}
                        >
                          <SelectTrigger id="select-bank">
                            <SelectValue placeholder="Choose bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {banksResponse?.data && banksResponse.data.length > 0 ? (
                              banksResponse.data.map((bank) => (
                                <SelectItem key={bank.id} value={bank.name}>
                                  {bank.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                                No banks available
                              </div>
                            )}
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

                  <form.Field
                    name="customFileName"
                    validators={{
                      onChange: ({ value }) => {
                        const result = fileUploadSchema.shape.customFileName.safeParse(value);
                        return result.success ? undefined : result.error.errors[0].message;
                      },
                    }}
                  >
                    {(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0}>
                        <FieldLabel htmlFor="custom-file-name">Custom File Name</FieldLabel>
                        <Input
                          id="custom-file-name"
                          placeholder="Enter custom name for file"
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
              </div>

              {/* Drag and Drop Zone */}
              <form.Field
                name="files"
                validators={{
                  onChange: ({ value }) => {
                    const result = fileUploadSchema.shape.files.safeParse(value);
                    return result.success ? undefined : result.error.errors[0].message;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <div className="space-y-4">
                      {/* File Requirements */}
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                        <h4 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-100">
                          CSV File Requirements
                        </h4>
                        <p className="mb-3 text-xs text-blue-800 dark:text-blue-200">
                          Your CSV file must include these required columns:
                        </p>
                        <ul className="space-y-1.5 text-xs text-blue-800 dark:text-blue-200">
                          <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                            <span>
                              <strong>Customer Name</strong> (or: Customer)
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                            <span>
                              <strong>Settlement Amount</strong> (or: Settlement Amt)
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                            <span>
                              <strong>Mobile Number</strong> (or: Mobile No)
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                            <span>
                              <strong>Email ID</strong> (or: Email)
                            </span>
                          </li>
                        </ul>
                      </div>

                      <section
                        aria-label="File upload drop zone"
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, field.handleChange, field.state.value)}
                        className={cn(
                          'relative rounded-lg border-2 border-dashed transition-colors',
                          isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                          field.state.meta.errors.length > 0 ? 'border-red-500' : '',
                        )}
                      >
                        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                          <div
                            className={cn(
                              'mb-4 rounded-full p-4 transition-colors',
                              isDragging ? 'bg-primary/10' : 'bg-muted',
                            )}
                          >
                            <Upload
                              className={cn(
                                'h-10 w-10',
                                isDragging ? 'text-primary' : 'text-muted-foreground',
                              )}
                            />
                          </div>
                          <div className="mb-3">
                            <p className="text-base font-semibold">
                              {isDragging ? 'Drop your files here' : 'Upload Files'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Drag and drop your files here, or click to browse
                            </p>
                          </div>
                          <Button type="button" variant="outline" size="lg" asChild>
                            <label className="cursor-pointer">
                              Select CSV Files
                              <input
                                type="file"
                                className="hidden"
                                multiple
                                accept=".csv"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    const newFiles = Array.from(e.target.files);
                                    field.handleChange([...field.state.value, ...newFiles]);
                                  }
                                }}
                              />
                            </label>
                          </Button>
                        </div>
                      </section>

                      {/* Selected Files List */}
                      {field.state.value.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">
                            Selected Files ({field.state.value.length})
                          </h4>
                          <div className="grid gap-2">
                            {field.state.value.map((file, index) => (
                              <Card
                                key={`${file.name}-${index}`}
                                className="border-primary/50 bg-primary/5"
                              >
                                <div className="flex items-center gap-4 p-3">
                                  <div className="rounded-lg bg-primary/10 p-2">
                                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                                  </div>

                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold">{file.name}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {(file.size / 1024).toFixed(1)} KB •{' '}
                                      {file.type || 'Unknown type'}
                                    </p>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeFile(index, field.state.value, field.handleChange)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/campaigns/files')}
                >
                  Cancel
                </Button>

                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="min-w-35"
                    >
                      {isSubmitting ? 'Creating Files...' : 'Create Files'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
