/** biome-ignore-all lint/a11y/noStaticElementInteractions: click handlers on card sections are intentional */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: click handlers on card sections are intentional */
'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import {
  Building2,
  CheckSquare,
  ExternalLink,
  Globe,
  ImageOff,
  Loader2,
  Mail,
  Map as MapIcon,
  MapPin,
  Phone,
  Save,
  Search,
  Square,
  Star,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { COUNTRIES } from '../lib/countries';
import { bulkCreateBusinessLeads, createBusinessLead, searchBusinessLeads } from '../services';
import type { SearchResult } from '../types';

export function BusinessLeadSearchForm() {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  // Per-card email overrides (pre-populated from auto-detection, user can edit)
  const [emails, setEmails] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const [notes, setNotes] = useState('');

  const searchMutation = useMutation({
    mutationFn: searchBusinessLeads,
    onSuccess: (data) => {
      setResults(data.results);
      // Pre-populate emails from auto-extracted values
      const initialEmails: Record<number, string> = {};
      data.results.forEach((r, i) => {
        if (r.email) initialEmails[i] = r.email;
      });
      setEmails(initialEmails);
      setSelected(new Set());
      setHasSearched(true);
      const emailCount = data.results.filter((r) => r.email).length;
      if (data.results.length === 0) {
        toast.info('No results found. Try a different location.');
      } else {
        toast.success(
          `Found ${data.results.length} result${data.results.length !== 1 ? 's' : ''}` +
            (emailCount > 0 ? ` · ${emailCount} emails auto-detected` : ''),
        );
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: bulkCreateBusinessLeads,
    onSuccess: (data) => {
      toast.success(`${data.saved} lead${data.saved !== 1 ? 's' : ''} saved`);
      router.push('/business-leads/list');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveSingleMutation = useMutation({
    mutationFn: createBusinessLead,
    onSuccess: () => toast.success('Lead saved'),
    onError: (e: Error) => toast.error(e.message),
  });

  const form = useForm({
    defaultValues: { type: '', area: '', city: '', country: '', location: '' },
    onSubmit: async ({ value }) => {
      if (!value.type.trim() || !value.area.trim() || !value.city.trim()) return;
      searchMutation.mutate({
        type: value.type.trim(),
        area: value.area.trim(),
        city: value.city.trim(),
        country: value.country || undefined,
        location: value.location?.trim() || undefined,
      });
    },
  });

  function setEmail(idx: number, value: string) {
    setEmails((prev) => ({ ...prev, [idx]: value }));
  }

  function toggleSelect(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function toggleAll() {
    setSelected(selected.size === results.length ? new Set() : new Set(results.map((_, i) => i)));
  }

  function buildPayload(idx: number) {
    const r = results[idx];
    return {
      type: r.type,
      name: r.name,
      email: (emails[idx] ?? '').trim() || undefined,
      phone: r.phone || undefined,
      address: r.address || undefined,
      area: r.area,
      city: r.city,
      location: r.location || undefined,
      notes: notes || undefined,
    };
  }

  function handleSaveSelected() {
    const toSave = [...selected].map((idx) => buildPayload(idx));
    saveMutation.mutate({ leads: toSave });
  }

  const allSelected = results.length > 0 && selected.size === results.length;
  const someSelected = selected.size > 0;
  const emailCount = Object.values(emails).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search &amp; Add Leads</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Searches Google Places for businesses, crawls their websites for contact emails, and
          scores each lead by data completeness.
        </p>
      </div>

      {/* Search form */}
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
              <form.Field
                name="type"
                validators={{
                  onSubmit: ({ value }) =>
                    !value?.trim() ? 'Industry type is required' : undefined,
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>
                      Industry / Type <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Veterinarian, Pet Clinic, or any custom type..."
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

              <form.Field
                name="area"
                validators={{
                  onSubmit: ({ value }) => (!value?.trim() ? 'Area is required' : undefined),
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>
                      Area / District <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Manhattan, Silicon Valley..."
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
                      placeholder="e.g. New York, New Jersey..."
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

              <form.Field name="country">
                {(field) => (
                  <Field>
                    <FieldLabel>Country (optional)</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v === '__none__' ? '' : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="__none__">— Any country —</SelectItem>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Field name="location">
                {(field) => (
                  <Field>
                    <FieldLabel>Landmark / Near (optional)</FieldLabel>
                    <Input
                      placeholder="e.g. Near Times Square, Route 9..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <Field>
              <FieldLabel>Notes (optional — applied to all saved leads)</FieldLabel>
              <Textarea
                placeholder="Any notes to attach..."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                All pages of results are fetched. Websites are crawled automatically for email
                addresses.
              </p>
              <Button type="submit" disabled={searchMutation.isPending}>
                {searchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching & crawling…
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

      {/* Results */}
      {hasSearched && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-medium">Results</h2>
              <Badge variant="secondary">{results.length} companies</Badge>
              {emailCount > 0 && (
                <Badge variant="outline" className="text-green-700 border-green-300">
                  <Mail className="mr-1 h-3 w-3" />
                  {emailCount} emails found
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {allSelected ? (
                  <>
                    <CheckSquare className="mr-1.5 h-3.5 w-3.5" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="mr-1.5 h-3.5 w-3.5" />
                    Select All
                  </>
                )}
              </Button>
              {someSelected && (
                <Button size="sm" onClick={handleSaveSelected} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save Selected ({selected.size})
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result, idx) => (
              <ResultCard
                key={`${result.name}-${idx}`}
                result={result}
                email={emails[idx] ?? ''}
                onEmailChange={(v) => setEmail(idx, v)}
                selected={selected.has(idx)}
                onToggle={() => toggleSelect(idx)}
                onSave={() => saveSingleMutation.mutate(buildPayload(idx))}
                saving={saveSingleMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {hasSearched && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="text-muted-foreground mb-3 h-10 w-10" />
            <p className="font-medium">No results found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Try a different industry type, area, or city.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : score >= 40
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

  const label = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${color}`}
      title={`Lead score: ${score}/95`}
    >
      <Star className="h-2.5 w-2.5" />
      {score} · {label}
    </span>
  );
}

function ResultCard({
  result,
  email,
  onEmailChange,
  selected,
  onToggle,
  onSave,
  saving,
}: {
  result: SearchResult;
  email: string;
  onEmailChange: (v: string) => void;
  selected: boolean;
  onToggle: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const wasAutoDetected = !!result.email;

  return (
    <Card
      className={`overflow-hidden transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
      }`}
    >
      {/* Photo banner */}
      <div className="relative h-28 w-full cursor-pointer bg-muted" onClick={onToggle}>
        {result.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.photoUrl}
            alt={result.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.nextSibling as HTMLElement | null)?.style.setProperty(
                'display',
                'flex',
              );
            }}
          />
        ) : null}
        {/* Fallback shown when no photo or image fails to load */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-muted ${result.photoUrl ? 'hidden' : 'flex'}`}
        >
          <ImageOff className="h-6 w-6 text-muted-foreground/40" />
        </div>
        {/* Selection overlay badge */}
        {selected && (
          <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow">
            <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
              <title>Selected</title>
              <path
                d="M2 6l3 3 5-5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      <CardContent className="space-y-3 pt-3 pb-3">
        {/* Header row: name + badges */}
        <div className="cursor-pointer" onClick={onToggle}>
          <p className="truncate text-sm font-semibold leading-tight">{result.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {result.type}
            </Badge>
            <ScoreBadge score={result.score} />
            {result.rating > 0 && (
              <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                {result.rating.toFixed(1)}
              </span>
            )}
            {result.source === 'justdial' ? (
              <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                JD
              </span>
            ) : (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                G
              </span>
            )}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <span className="text-muted-foreground mb-1 flex items-center gap-1 text-xs font-medium">
            <Mail className="h-3 w-3" />
            Email
            {wasAutoDetected && (
              <span className="ml-1 rounded bg-green-100 px-1 py-0.5 text-[9px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                AUTO
              </span>
            )}
          </span>
          <Input
            type="email"
            placeholder="No email found — enter manually"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={`h-8 text-xs ${
              email
                ? 'border-green-500 focus-visible:ring-green-500'
                : 'border-muted focus-visible:ring-ring'
            }`}
          />
        </div>

        {/* Phone, address, website, maps */}
        <div className="space-y-1 text-xs" onClick={(e) => e.stopPropagation()}>
          {result.phone && (
            <div className="text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{result.phone}</span>
            </div>
          )}
          {result.address && (
            <div className="text-muted-foreground flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="line-clamp-2 leading-snug">{result.address}</span>
            </div>
          )}
          {result.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="text-muted-foreground h-3 w-3 shrink-0" />
              <a
                href={result.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary flex items-center gap-0.5 truncate hover:underline"
              >
                {result.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </a>
            </div>
          )}
          {result.mapsUrl && (
            <div className="flex items-center gap-1.5">
              <MapIcon className="text-muted-foreground h-3 w-3 shrink-0" />
              <a
                href={result.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary truncate hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          )}
        </div>

        {/* Save button */}
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant={email ? 'default' : 'outline'}
            size="sm"
            className="h-7 w-full text-xs"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <UserPlus className="mr-1 h-3 w-3" />
            )}
            Save as Lead
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
