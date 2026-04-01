/** biome-ignore-all lint/a11y/useButtonType: table action buttons */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: table rows handle click */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: table rows handle click */
'use no memo';
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  Activity,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Layers,
  Loader2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  createScheduler,
  deleteScheduler,
  getSchedulers,
  runAllSchedulers,
  runCrossSearch,
  runOneScheduler,
  scheduleAllUSStates,
  updateScheduler,
} from '../services';
import type {
  CreateSchedulerPayload,
  LeadGenerationScheduler,
  ScheduleAllUSStatesPayload,
  ScheduleType,
  UpdateSchedulerPayload,
} from '../types';
import { CountryCombobox } from './country-combobox';
import { StateCombobox } from './state-combobox';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function fmtTime(h: number, m: number) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatSchedule(s: LeadGenerationScheduler): string {
  const t = fmtTime(s.scheduledHour, s.scheduledMinute);
  if (s.scheduleType === 'daily') return `Daily · ${t}`;
  if (s.scheduleType === 'weekly') return `${DAYS_SHORT[s.scheduledDay ?? 1]} · ${t}`;
  return `Day ${s.scheduledDay ?? 1} · ${t}`;
}

function formatScheduleLong(s: LeadGenerationScheduler): string {
  const t = fmtTime(s.scheduledHour, s.scheduledMinute);
  if (s.scheduleType === 'daily') return `Every day at ${t}`;
  if (s.scheduleType === 'weekly') return `Every ${DAYS_FULL[s.scheduledDay ?? 1]} at ${t}`;
  return `Monthly on day ${s.scheduledDay ?? 1} at ${t}`;
}

const scheduleTypeConfig = {
  daily: { label: 'Daily', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50' },
  weekly: { label: 'Weekly', icon: CalendarDays, color: 'text-violet-600', bg: 'bg-violet-50' },
  monthly: { label: 'Monthly', icon: CalendarClock, color: 'text-amber-600', bg: 'bg-amber-50' },
} as const;

// ─── Schedule type selector ────────────────────────────────────────────────────

function ScheduleTypeSelector({
  value,
  onChange,
}: {
  value: ScheduleType;
  onChange: (v: ScheduleType) => void;
}) {
  const types: ScheduleType[] = ['daily', 'weekly', 'monthly'];
  return (
    <div className="grid grid-cols-3 gap-2">
      {types.map((type) => {
        const cfg = scheduleTypeConfig[type];
        const Icon = cfg.icon;
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-medium transition-all duration-150',
              active
                ? `border-primary ${cfg.bg} ${cfg.color}`
                : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/40',
            )}
          >
            <Icon className={cn('h-4 w-4', active ? cfg.color : '')} />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Time picker ──────────────────────────────────────────────────────────────

function TimePicker({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  hour: number;
  minute: number;
  onHourChange: (v: number) => void;
  onMinuteChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center gap-1 flex-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Hour
        </span>
        <div className="relative">
          <Input
            type="number"
            min={0}
            max={23}
            value={String(hour).padStart(2, '0')}
            onChange={(e) => onHourChange(Number(e.target.value))}
            className="h-11 w-full text-center text-xl font-semibold tabular-nums"
          />
        </div>
      </div>
      <span className="mt-4 text-2xl font-bold text-muted-foreground select-none">:</span>
      <div className="flex flex-col items-center gap-1 flex-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Minute
        </span>
        <Input
          type="number"
          min={0}
          max={59}
          value={String(minute).padStart(2, '0')}
          onChange={(e) => onMinuteChange(Number(e.target.value))}
          className="h-11 w-full text-center text-xl font-semibold tabular-nums"
        />
      </div>
    </div>
  );
}

// ─── Form field wrapper ────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function SchedulerActions({ scheduler }: { scheduler: LeadGenerationScheduler }) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: runNow, isPending: isRunning } = useMutation({
    mutationFn: () => runOneScheduler(scheduler.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-generation-schedulers'] });
      toast.success(`"${scheduler.name}" triggered — running now`);
    },
    onError: () => toast.error('Failed to trigger scheduler'),
  });

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteScheduler(scheduler.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-generation-schedulers'] });
      toast.success('Scheduler deleted');
      setOpen(false);
    },
    onError: () => toast.error('Failed to delete scheduler'),
  });

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            className="h-7 w-7 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              runNow();
            }}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="mr-2 h-3.5 w-3.5" />
            )}
            Run now
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
              setDropdownOpen(false);
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheduler</AlertDialogTitle>
            <AlertDialogDescription>
              Delete{' '}
              <span className="font-semibold text-foreground">&quot;{scheduler.name}&quot;</span>?
              The cron job will stop and no further leads will be collected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                deleteMutate();
              }}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Detail / Edit drawer ─────────────────────────────────────────────────────

interface EditForm extends UpdateSchedulerPayload {
  isEnabled: boolean;
}

function SchedulerDetailSheet({
  scheduler,
  onClose,
  onUpdate,
}: {
  scheduler: LeadGenerationScheduler | null;
  onClose: () => void;
  onUpdate: (updated: LeadGenerationScheduler) => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EditForm>({ isEnabled: true });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (scheduler) {
      setForm({
        name: scheduler.name,
        leadType: scheduler.leadType,
        state: scheduler.state,
        stateCode: scheduler.stateCode,
        country: scheduler.country,
        countryCode: scheduler.countryCode,
        scheduleType: scheduler.scheduleType,
        scheduledHour: scheduler.scheduledHour,
        scheduledMinute: scheduler.scheduledMinute,
        scheduledDay: scheduler.scheduledDay,
        isEnabled: scheduler.isEnabled,
      });
      setEditing(false);
    }
  }, [scheduler]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateScheduler(scheduler?.id ?? '', form),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['lead-generation-schedulers'] });
      toast.success('Scheduler updated');
      setEditing(false);
      onUpdate(updated);
    },
    onError: () => toast.error('Failed to update scheduler'),
  });

  const { mutate: toggleEnabled, isPending: isToggling } = useMutation({
    mutationFn: (val: boolean) => updateScheduler(scheduler?.id ?? '', { isEnabled: val }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['lead-generation-schedulers'] });
      onUpdate(updated);
    },
    onError: () => {
      if (scheduler) setForm((f) => ({ ...f, isEnabled: scheduler.isEnabled }));
      toast.error('Failed to toggle scheduler');
    },
  });

  const isOpen = !!scheduler;
  const scheduleType = (form.scheduleType ?? scheduler?.scheduleType ?? 'daily') as ScheduleType;
  const cfg = scheduleTypeConfig[scheduleType];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md overflow-hidden">
        {scheduler && (
          <>
            {/* Header band */}
            <div className="relative border-b bg-gradient-to-br from-muted/60 to-muted/20 px-6 pt-6 pb-5">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>

              <div className="flex items-start gap-3 pr-6">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    cfg.bg,
                  )}
                >
                  <cfg.icon className={cn('h-5 w-5', cfg.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold leading-tight">
                    {scheduler.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatScheduleLong(scheduler)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Badge variant={scheduler.isEnabled ? 'default' : 'secondary'} className="text-xs">
                  <span
                    className={cn(
                      'mr-1.5 h-1.5 w-1.5 rounded-full',
                      scheduler.isEnabled ? 'bg-green-400' : 'bg-muted-foreground/50',
                    )}
                  />
                  {scheduler.isEnabled ? 'Active' : 'Paused'}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize font-medium">
                  {scheduler.scheduleType}
                </Badge>
                <code className="ml-auto rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {scheduler.cronPattern}
                </code>
              </div>
            </div>

            <div className="flex flex-col gap-0 flex-1 overflow-y-auto">
              {/* Enable / disable toggle */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <p className="text-sm font-medium">
                    {form.isEnabled ? 'Scheduler active' : 'Scheduler paused'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.isEnabled
                      ? 'Running on schedule, collecting leads'
                      : 'Paused — no new leads will be collected'}
                  </p>
                </div>
                <Switch
                  checked={form.isEnabled}
                  disabled={isToggling}
                  onCheckedChange={(val) => {
                    setForm((f) => ({ ...f, isEnabled: val }));
                    toggleEnabled(val);
                  }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 border-b">
                <div className="border-r px-6 py-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Layers className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Leads collected</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">
                    {scheduler.totalLeadsGenerated.toLocaleString()}
                  </p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Last run</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {scheduler.lastRunAt ? dayjs(scheduler.lastRunAt).format('MMM D, HH:mm') : '—'}
                  </p>
                  {scheduler.lastRunAt && (
                    <p className="text-xs text-muted-foreground">
                      {dayjs(scheduler.lastRunAt).format('YYYY')}
                    </p>
                  )}
                </div>
              </div>

              {/* View / Edit body */}
              <div className="px-6 py-5 flex flex-col gap-4">
                {editing ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Edit scheduler</h3>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Cancel
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Field label="Name" required>
                        <Input
                          value={form.name ?? ''}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Daily Electronics NY"
                        />
                      </Field>

                      <Field label="Lead type" required>
                        <Input
                          value={form.leadType ?? ''}
                          onChange={(e) => setForm((f) => ({ ...f, leadType: e.target.value }))}
                          placeholder="e.g. electronics manufacturer"
                        />
                      </Field>

                      <Field label="Country" required>
                        <CountryCombobox
                          value={form.country ?? ''}
                          onChange={(name, code) =>
                            setForm((f) => ({
                              ...f,
                              country: name,
                              countryCode: code,
                              state: '',
                              stateCode: '',
                            }))
                          }
                        />
                      </Field>

                      <Field label="State / Region" required>
                        <StateCombobox
                          value={form.state ?? ''}
                          countryName={form.country ?? ''}
                          onChange={(name, code) =>
                            setForm((f) => ({ ...f, state: name, stateCode: code }))
                          }
                        />
                      </Field>

                      <Field label="Schedule type">
                        <ScheduleTypeSelector
                          value={scheduleType}
                          onChange={(v) =>
                            setForm((f) => ({ ...f, scheduleType: v, scheduledDay: undefined }))
                          }
                        />
                      </Field>

                      <Field label="Run time">
                        <TimePicker
                          hour={form.scheduledHour ?? scheduler.scheduledHour}
                          minute={form.scheduledMinute ?? scheduler.scheduledMinute}
                          onHourChange={(v) => setForm((f) => ({ ...f, scheduledHour: v }))}
                          onMinuteChange={(v) => setForm((f) => ({ ...f, scheduledMinute: v }))}
                        />
                      </Field>

                      {scheduleType !== 'daily' && (
                        <Field
                          label={
                            scheduleType === 'weekly'
                              ? 'Day of week (0 = Sun … 6 = Sat)'
                              : 'Day of month (1–31)'
                          }
                        >
                          <Input
                            type="number"
                            min={scheduleType === 'weekly' ? 0 : 1}
                            max={scheduleType === 'weekly' ? 6 : 31}
                            value={form.scheduledDay ?? scheduler.scheduledDay ?? ''}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, scheduledDay: Number(e.target.value) }))
                            }
                            placeholder={scheduleType === 'weekly' ? '0–6' : '1–31'}
                            className="text-center text-lg font-semibold tabular-nums"
                          />
                        </Field>
                      )}

                      <Button onClick={() => save()} disabled={isPending} className="w-full mt-1">
                        {isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="mr-2 h-4 w-4" />
                        )}
                        Save changes
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Details</h3>
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    </div>

                    <div className="flex flex-col gap-0 rounded-xl border overflow-hidden">
                      <InfoRow icon={<Layers className="h-3.5 w-3.5" />} label="Lead type">
                        {scheduler.leadType}
                      </InfoRow>
                      <InfoRow icon={<Globe className="h-3.5 w-3.5" />} label="Country">
                        <span>{scheduler.country}</span>
                        <code className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                          {scheduler.countryCode}
                        </code>
                      </InfoRow>
                      <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="State">
                        <span>{scheduler.state}</span>
                        {scheduler.stateCode && (
                          <code className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                            {scheduler.stateCode}
                          </code>
                        )}
                      </InfoRow>
                      <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Schedule">
                        {formatScheduleLong(scheduler)}
                      </InfoRow>
                      <InfoRow icon={<CalendarClock className="h-3.5 w-3.5" />} label="Created">
                        {scheduler.createdAt
                          ? dayjs(scheduler.createdAt).format('MMM D, YYYY')
                          : '—'}
                      </InfoRow>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 text-sm">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex min-w-0 flex-1 items-center">{children}</span>
    </div>
  );
}

// ─── Create form drawer ───────────────────────────────────────────────────────

const emptyCreate: CreateSchedulerPayload = {
  name: '',
  leadType: '',
  country: '',
  countryCode: '',
  state: '',
  stateCode: '',
  scheduleType: 'daily',
  scheduledHour: 9,
  scheduledMinute: 0,
};

function CreateSchedulerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateSchedulerPayload>(emptyCreate);

  const { mutate, isPending } = useMutation({
    mutationFn: () => createScheduler(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-generation-schedulers'] });
      toast.success('Scheduler created');
      setForm(emptyCreate);
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create scheduler'),
  });

  const isValid =
    form.name.trim() && form.leadType.trim() && form.country.trim() && form.state.trim();

  const scheduleType = form.scheduleType;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md overflow-hidden">
        {/* Header */}
        <div className="border-b bg-gradient-to-br from-primary/5 to-transparent px-6 pt-6 pb-5">
          <div className="flex items-center gap-3 pr-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">New Scheduler</SheetTitle>
              <SheetDescription className="text-xs">
                Automate lead collection on a recurring schedule
              </SheetDescription>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5 flex-1">
          {/* Section: Identity */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Identity
            </p>
            <Field label="Scheduler name" required>
              <Input
                placeholder="e.g. Daily Electronics NY"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </Field>
            <Field label="Lead type" required>
              <Input
                placeholder="e.g. electronics manufacturer"
                value={form.leadType}
                onChange={(e) => setForm((f) => ({ ...f, leadType: e.target.value }))}
              />
            </Field>
          </div>

          <div className="border-t" />

          {/* Section: Location */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Target location
            </p>
            <Field label="Country" required>
              <CountryCombobox
                value={form.country}
                onChange={(name, code) =>
                  setForm((f) => ({
                    ...f,
                    country: name,
                    countryCode: code,
                    state: '',
                    stateCode: '',
                  }))
                }
              />
            </Field>
            <Field label="State / Region" required>
              <StateCombobox
                value={form.state}
                countryName={form.country}
                onChange={(name, code) => setForm((f) => ({ ...f, state: name, stateCode: code }))}
              />
            </Field>
          </div>

          <div className="border-t" />

          {/* Section: Schedule */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Schedule
            </p>

            <Field label="Frequency" required>
              <ScheduleTypeSelector
                value={scheduleType}
                onChange={(v) =>
                  setForm((f) => ({ ...f, scheduleType: v, scheduledDay: undefined }))
                }
              />
            </Field>

            <Field label="Run time" required>
              <TimePicker
                hour={form.scheduledHour}
                minute={form.scheduledMinute}
                onHourChange={(v) => setForm((f) => ({ ...f, scheduledHour: v }))}
                onMinuteChange={(v) => setForm((f) => ({ ...f, scheduledMinute: v }))}
              />
            </Field>

            {scheduleType !== 'daily' && (
              <Field
                label={
                  scheduleType === 'weekly'
                    ? 'Day of week (0 = Sun … 6 = Sat)'
                    : 'Day of month (1–31)'
                }
                required
              >
                <Input
                  type="number"
                  min={scheduleType === 'weekly' ? 0 : 1}
                  max={scheduleType === 'weekly' ? 6 : 31}
                  value={form.scheduledDay ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDay: Number(e.target.value) }))}
                  placeholder={scheduleType === 'weekly' ? '0 = Sunday … 6 = Saturday' : '1–31'}
                  className="text-center text-lg font-semibold tabular-nums"
                />
              </Field>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button disabled={!isValid || isPending} onClick={() => mutate()}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {isPending ? 'Creating…' : 'Create scheduler'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── All-US-states one-time job sheet ────────────────────────────────────────

const US_LEAD_TYPE_PRESETS: { category: string; types: string[] }[] = [
  {
    category: 'Manufacturing',
    types: [
      'Industrial Automation Companies',
      'Metal Fabrication Companies',
      'Plastics Manufacturing',
      'Electronics Manufacturing',
      'Food Processing Companies',
      'Packaging Companies',
    ],
  },
  {
    category: 'Professional Services',
    types: [
      'Law Firms',
      'Accounting Firms',
      'Financial Advisors',
      'Insurance Agencies',
      'Marketing Agencies',
      'HR Consulting Firms',
      'IT Services Companies',
    ],
  },
  {
    category: 'Healthcare',
    types: [
      'Medical Clinics',
      'Dental Clinics',
      'Physical Therapy Centers',
      'Chiropractic Offices',
      'Urgent Care Centers',
      'Home Health Agencies',
      'Mental Health Counselors',
    ],
  },
  {
    category: 'Real Estate & Construction',
    types: [
      'Real Estate Agencies',
      'General Contractors',
      'Roofing Companies',
      'Commercial Real Estate Brokers',
      'Property Management Companies',
      'Interior Design Firms',
    ],
  },
  {
    category: 'Technology',
    types: [
      'Software Development Companies',
      'IT Staffing Companies',
      'Cybersecurity Companies',
      'Cloud Services Companies',
      'Data Analytics Companies',
      'Managed Service Providers',
    ],
  },
  {
    category: 'Energy & Utilities',
    types: [
      'Solar Energy Companies',
      'HVAC Companies',
      'Electrical Contractors',
      'Plumbing Companies',
      'Energy Consulting Firms',
    ],
  },
  {
    category: 'Logistics & Transport',
    types: [
      'Trucking Companies',
      'Freight Brokerage Firms',
      'Warehousing Companies',
      'Last Mile Delivery Companies',
      'Supply Chain Consultants',
    ],
  },
  {
    category: 'Finance',
    types: [
      'Mortgage Brokers',
      'Credit Unions',
      'Investment Firms',
      'Payroll Service Providers',
      'Business Loan Brokers',
    ],
  },
];

function localDatetimeDefault(): string {
  const d = new Date();
  d.setHours(10, 30, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AllUSStatesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ScheduleAllUSStatesPayload>({
    name: '',
    leadType: '',
    runAt: localDatetimeDefault(),
  });
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  function pickPreset(type: string) {
    setForm((f) => ({
      ...f,
      leadType: type,
      name: f.name.trim() ? f.name : `${type} – All US States`,
    }));
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload: ScheduleAllUSStatesPayload = {
        name: form.name,
        leadType: form.leadType,
        runAt: form.runAt ? new Date(form.runAt).toISOString() : undefined,
      };
      return scheduleAllUSStates(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-generation-schedulers'] });
      toast.success('All-US-states job scheduled');
      setForm({ name: '', leadType: '', runAt: localDatetimeDefault() });
      setExpandedCategory(null);
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to schedule job'),
  });

  const isValid = form.name.trim() && form.leadType.trim();

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-lg overflow-hidden">
        {/* Header */}
        <div className="border-b bg-gradient-to-br from-emerald-50 to-transparent px-6 pt-6 pb-5">
          <div className="flex items-center gap-3 pr-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Globe className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <SheetTitle className="text-base">Search All US States</SheetTitle>
              <SheetDescription className="text-xs">
                One-time job — searches all 50 states and bulk-saves leads
              </SheetDescription>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5 flex-1">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-800">
            <strong>How it works:</strong> A single job loops through all 50 US states, searches
            Google Places for your lead type in each state, and auto-saves every new lead found.
          </div>

          {/* Lead type presets */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pick a lead type (or type your own below)
            </p>
            <div className="flex flex-col gap-1 rounded-xl border overflow-hidden">
              {US_LEAD_TYPE_PRESETS.map((cat) => {
                const isOpen = expandedCategory === cat.category;
                return (
                  <div key={cat.category} className="border-b last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setExpandedCategory(isOpen ? null : cat.category)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium hover:bg-muted/40 transition-colors"
                    >
                      <span>{cat.category}</span>
                      <ChevronRight
                        className={cn(
                          'h-3.5 w-3.5 text-muted-foreground transition-transform',
                          isOpen && 'rotate-90',
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="flex flex-wrap gap-1.5 bg-muted/20 px-4 pb-3 pt-1">
                        {cat.types.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => pickPreset(type)}
                            className={cn(
                              'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                              form.leadType === type
                                ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                                : 'border-border bg-background text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700',
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t" />

          <Field label="Lead type" required>
            <Input
              placeholder="e.g. Industrial Automation Companies"
              value={form.leadType}
              onChange={(e) => setForm((f) => ({ ...f, leadType: e.target.value }))}
            />
          </Field>

          <Field label="Job name" required>
            <Input
              placeholder="e.g. Industrial Automation – All States"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>

          <Field label="Run at (local time)">
            <Input
              type="datetime-local"
              value={form.runAt ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, runAt: e.target.value || undefined }))}
            />
            <p className="text-[11px] text-muted-foreground">
              Leave blank to run immediately. Default is today at 10:30 AM.
            </p>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            disabled={!isValid || isPending}
            onClick={() => mutate()}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            {isPending ? 'Scheduling…' : 'Schedule Job'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SchedulerList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const urlSearch = searchParams.get('search') || '';

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });
  const [search, setSearch] = useState(urlSearch);
  const [selected, setSelected] = useState<LeadGenerationScheduler | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [allUSOpen, setAllUSOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: runAll, isPending: isRunningAll } = useMutation({
    mutationFn: runAllSchedulers,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['lead-generation-schedulers'] });
      toast.success(`${res.triggered} scheduler${res.triggered === 1 ? '' : 's'} triggered`);
    },
    onError: () => toast.error('Failed to run all schedulers'),
  });

  const { mutate: runCross, isPending: isRunningCross } = useMutation({
    mutationFn: runCrossSearch,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['lead-generation-schedulers'] });
      toast.success(
        `Cross search started — ${res.leadTypes} lead types × ${res.states} states = ${res.jobsQueued} jobs`,
      );
    },
    onError: () => toast.error('Failed to start cross search'),
  });

  const updateParams = useCallback(
    (updates: { page?: number; pageSize?: number; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) params.set('page', String(updates.page));
      if (updates.pageSize !== undefined) params.set('pageSize', String(updates.pageSize));
      if (updates.search !== undefined) {
        updates.search ? params.set('search', updates.search) : params.delete('search');
        params.set('page', '1');
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      if (search !== urlSearch) updateParams({ search });
    }, 500);
    return () => clearTimeout(id);
  }, [search, urlSearch, updateParams]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lead-generation-schedulers', { page, limit: pageSize, search: urlSearch }],
    queryFn: () => getSchedulers({ page, limit: pageSize, search: urlSearch || undefined }),
  });

  const columnHelper = createColumnHelper<LeadGenerationScheduler>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Scheduler',
      cell: ({ getValue, row }) => {
        const s = row.original;
        const cfg = scheduleTypeConfig[s.scheduleType as ScheduleType];
        const Icon = cfg.icon;
        return (
          <div className="flex items-center gap-3">
            <div
              className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.bg)}
            >
              <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm leading-tight">{getValue()}</span>
              <span className="text-xs text-muted-foreground truncate">{s.leadType}</span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('country', {
      header: 'Location',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{row.original.country}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.state}
            {row.original.stateCode ? (
              <code className="ml-1 text-[10px] font-mono opacity-70">
                ({row.original.stateCode})
              </code>
            ) : null}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('scheduleType', {
      header: 'Schedule',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium tabular-nums">
            {fmtTime(row.original.scheduledHour, row.original.scheduledMinute)}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {formatSchedule(row.original)}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('isEnabled', {
      header: 'Status',
      cell: ({ getValue }) => {
        const on = getValue();
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                on
                  ? 'bg-emerald-500 shadow-[0_0_6px_1px] shadow-emerald-400/60'
                  : 'bg-muted-foreground/30',
              )}
            />
            <span
              className={cn(
                'text-xs font-medium',
                on ? 'text-emerald-700' : 'text-muted-foreground',
              )}
            >
              {on ? 'Active' : 'Paused'}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('totalLeadsGenerated', {
      header: 'Leads',
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold tabular-nums">{getValue().toLocaleString()}</span>
      ),
    }),
    columnHelper.accessor('lastRunAt', {
      header: 'Last run',
      cell: ({ getValue }) => {
        const v = getValue();
        return (
          <span className="text-xs text-muted-foreground">
            {v ? dayjs(v).format('MMM D, HH:mm') : '—'}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <SchedulerActions scheduler={row.original} />
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    columns,
    data: data?.data ?? [],
    state: { pagination },
    manualPagination: true,
    pageCount: data?.meta?.totalPages ?? 0,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(next);
      updateParams({ page: next.pageIndex + 1, pageSize: next.pageSize });
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const total = data?.meta?.total ?? 0;

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-8"
            placeholder="Search schedulers…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Show</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(val) => updateParams({ pageSize: Number(val), page: 1 })}
            >
              <SelectTrigger className="h-9 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>rows</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50"
            disabled={isRunningCross}
            onClick={() => runCross()}
          >
            {isRunningCross ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Layers className="h-3.5 w-3.5" />
            )}
            Cross Search
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1.5"
            disabled={isRunningAll}
            onClick={() => runAll()}
          >
            {isRunningAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            Run All Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => setAllUSOpen(true)}
          >
            <Globe className="h-3.5 w-3.5" />
            All US States
          </Button>
          <Button size="sm" className="h-9 gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            New Scheduler
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        {isError ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="rounded-full bg-destructive/10 p-3">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <p>Failed to load schedulers</p>
          </div>
        ) : isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground h-10"
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group/row cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => setSelected(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="rounded-2xl bg-muted p-5">
                        <CalendarClock className="h-8 w-8 opacity-40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">No schedulers yet</p>
                        <p className="text-xs">
                          Create one to start collecting leads automatically
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1 gap-1.5"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New Scheduler
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            {total} {total === 1 ? 'scheduler' : 'schedulers'}
            {urlSearch && (
              <span className="ml-1">
                matching{' '}
                <span className="font-medium text-foreground">&quot;{urlSearch}&quot;</span>
              </span>
            )}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[5rem] text-center text-xs text-muted-foreground">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Drawers */}
      <SchedulerDetailSheet
        scheduler={selected}
        onClose={() => setSelected(null)}
        onUpdate={(updated) => setSelected(updated)}
      />
      <CreateSchedulerSheet open={createOpen} onClose={() => setCreateOpen(false)} />
      <AllUSStatesSheet open={allUSOpen} onClose={() => setAllUSOpen(false)} />
    </div>
  );
}
