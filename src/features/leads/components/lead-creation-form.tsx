'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Building2, Loader2, Mail, MapPin, Phone, Search, Stethoscope, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { searchDoctors } from '../services';
import { type DoctorResult, LeadType } from '../types';

export function LeadCreationForm() {
  const [results, setResults] = useState<DoctorResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const mutation = useMutation({
    mutationFn: searchDoctors,
    onSuccess: (data) => {
      setResults(data.doctors);
      setHasSearched(true);
      if (data.doctors.length === 0) {
        toast.info('No results found for the given location.');
      } else {
        toast.success(`Found ${data.doctors.length} result${data.doctors.length !== 1 ? 's' : ''}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to search. Please try again.');
    },
  });

  const form = useForm({
    defaultValues: {
      type: '' as LeadType | '',
      area: '',
      city: '',
      location: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      if (!value.type || !value.area.trim() || !value.city.trim()) return;
      mutation.mutate({
        type: value.type as LeadType,
        area: value.area.trim(),
        city: value.city.trim(),
        location: value.location?.trim() || undefined,
        notes: value.notes?.trim() || undefined,
      });
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Lead</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Search for hospitals, clinics, or doctors in a specific area to generate leads.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Search Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Lead Type */}
              <form.Field
                name="type"
                validators={{
                  onSubmit: ({ value }) => (!value ? 'Please select a lead type' : undefined),
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>
                      Lead Type <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => field.handleChange(val as LeadType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={LeadType.Hospital}>Hospital</SelectItem>
                        <SelectItem value={LeadType.Clinic}>Clinic</SelectItem>
                        <SelectItem value={LeadType.Doctor}>Doctor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? String(field.state.meta.errors[0])
                        : ''}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              {/* Area */}
              <form.Field
                name="area"
                validators={{
                  onSubmit: ({ value }) => (!value?.trim() ? 'Area is required' : undefined),
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>
                      Area <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Anna Nagar"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? String(field.state.meta.errors[0])
                        : ''}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              {/* City */}
              <form.Field
                name="city"
                validators={{
                  onSubmit: ({ value }) => (!value?.trim() ? 'City is required' : undefined),
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>
                      City <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Chennai"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? String(field.state.meta.errors[0])
                        : ''}
                    </FieldError>
                  </Field>
                )}
              </form.Field>

              {/* Location (optional) */}
              <form.Field name="location">
                {(field) => (
                  <Field>
                    <FieldLabel>Location (optional)</FieldLabel>
                    <Input
                      placeholder="e.g. Near Metro Station"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            {/* Notes */}
            <form.Field name="notes">
              {(field) => (
                <Field>
                  <FieldLabel>Notes (optional)</FieldLabel>
                  <Textarea
                    placeholder="Any additional notes about this lead search..."
                    rows={3}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">Results</h2>
            <Badge variant="secondary">{results.length}</Badge>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Stethoscope className="text-muted-foreground mb-3 h-10 w-10" />
                <p className="text-muted-foreground text-sm">
                  No results found. Try a different area or city.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((doctor, index) => (
                <DoctorCard key={`${doctor.name}-${index}`} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DoctorCard({ doctor }: { doctor: DoctorResult }) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <User className="text-primary h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight">{doctor.name}</p>
            {doctor.hospital && (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 truncate text-xs">
                <Building2 className="h-3 w-3 shrink-0" />
                {doctor.hospital}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          {doctor.phone && (
            <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span className="text-muted-foreground truncate">{doctor.phone}</span>
            </div>
          )}
          {doctor.email && (
            <div className="flex items-center gap-2">
              <Mail className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span className="text-muted-foreground truncate">{doctor.email}</span>
            </div>
          )}
          {doctor.address && (
            <div className="flex items-start gap-2">
              <MapPin className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="text-muted-foreground text-xs leading-snug">{doctor.address}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
