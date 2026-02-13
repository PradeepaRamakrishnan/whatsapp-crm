'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { ChannelOrderItem } from '@/features/campaigns/types';
import Channel from '@/features/configuration/components/channel';
import { getConfigurationyId, updateConfiguration } from '@/features/settings/services';

const steps = [
  { id: 1, name: 'Template', description: 'Configure templates' },
  { id: 2, name: 'Channel', description: 'Configure channels' },
];

export default function EditConfigurationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const { data: config, isLoading } = useQuery({
    queryKey: ['configuration', id],
    queryFn: () => getConfigurationyId(id),
    enabled: !!id,
  });

  // State (lifted from main page)
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [smsEnabled, setSmsEnabled] = useState<boolean>(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
  const [emailTemplate, setEmailTemplate] = useState<string>('');
  const [smsTemplate, setSmsTemplate] = useState<string>('');
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('');

  // Scheduler State
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [frequency, setFrequency] = useState('0');
  const [interval, setInterval] = useState('0');
  const [channelOrder, setChannelOrder] = useState<ChannelOrderItem[]>([
    { channel: 'email', delayMs: 0, enabled: true },
    { channel: 'sms', delayMs: 10 * 60 * 1000, enabled: true },
    { channel: 'whatsapp', delayMs: 15 * 60 * 1000, enabled: true },
  ]);

  useEffect(() => {
    if (config) {
      // Map configuration to state using id for template selection
      if (config.emailTemplate) {
        setEmailEnabled(config.emailTemplate.active ?? true);
        setEmailTemplate(config.emailTemplate.id);
      }

      if (config.smsTemplate) {
        setSmsEnabled(config.smsTemplate.active ?? true);
        setSmsTemplate(config.smsTemplate.id);
      }

      if (config.whatsappTemplate) {
        setWhatsappEnabled(config.whatsappTemplate.active ?? true);
        setWhatsappTemplate(config.whatsappTemplate.id);
      }

      // Initialize Scheduler
      if (config.schedulerEnabled) {
        setScheduleMode('schedule');
      } else {
        setScheduleMode('now');
      }

      if (config.frequency) setFrequency(String(config.frequency));
      if (config.interval) setInterval(String(config.interval));

      // Initialize channel order if exists
      if (config.channelOrder && Array.isArray(config.channelOrder)) {
        setChannelOrder(config.channelOrder);
      }

      // Attempt to parse cron for existing values (basic parsing)
      if (config.cronPattern) {
        try {
          const parts = config.cronPattern.split(' ');
          if (parts.length >= 5) {
          }
        } catch (e) {
          console.error('Error parsing cron', e);
        }
      }
    }
  }, [config]);

  // const generateCron = () => {
  //   // Basic Cron Construction
  //   // Format: minute hour day(month) month day(week)

  //   // Parse scheduled time
  //   let minute = '*';
  //   let hour = '*';

  //   if (scheduledTime) {
  //     const [h, m] = scheduledTime.split(':').map(Number);
  //     if (!isNaN(h)) hour = h.toString();
  //     if (!isNaN(m)) minute = m.toString();
  //   } else {
  //     // Default to 0 if time not set but required for valid cron
  //     minute = '0';
  //     hour = '0';
  //   }

  //   // Adjust based on frequency and interval
  //   const intVal = parseInt(interval) || 1;

  //   // Note: This logic assumes "Start at [Time]" and then repeat [Frequency]
  //   // Valid standard cron doesn't easily support "Start Date". It does support repeating time.

  //   if (frequency === 'minutes') {
  //     return `*/${intVal} * * * *`;
  //   } else if (frequency === 'hours') {
  //     return `${minute} */${intVal} * * *`;
  //   } else if (frequency === 'days') {
  //     return `${minute} ${hour} */${intVal} * *`;
  //   } else if (frequency === 'weeks') {
  //     // Cron doesn't have "Every X weeks" easily without day-of-week math, using simple weekly
  //     return `${minute} ${hour} * * ${intVal === 1 ? '*' : '0'}`; // Simplified
  //   } else if (frequency === 'months') {
  //     return `${minute} ${hour} 1 */${intVal} *`;
  //   }

  //   return '* * * * *';
  // };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  // Build a cron expression from the selected date and time
  const generateCronFromSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      return null;
    }

    // scheduledDate: 'YYYY-MM-DD', scheduledTime: 'HH:MM'
    const [monthStr, dayStr] = scheduledDate.split('-').map((v) => Number(v));
    const [hourStr, minuteStr] = scheduledTime.split(':');

    const minute = Number(minuteStr ?? '0');
    const hour = Number(hourStr ?? '0');
    const day = Number(dayStr ?? '1');
    const month = Number(monthStr ?? '1');

    if (Number.isNaN(minute) || Number.isNaN(hour) || Number.isNaN(day) || Number.isNaN(month)) {
      return null;
    }

    // Backend expects 6-field cron (sec min hour DOM month DOW), e.g. '0 20 19 * * *'
    // Use 0 seconds, selected minute & hour, specific day/month, any day-of-week
    return `0 ${minute} ${hour} ${day} ${month} *`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {};

      if (emailEnabled && emailTemplate) {
        payload.emailTemplate = emailTemplate;
      }

      if (smsEnabled && smsTemplate) {
        payload.smsTemplate = smsTemplate;
      }

      if (whatsappEnabled && whatsappTemplate) {
        payload.whatsappTemplate = whatsappTemplate;
      }

      if (scheduleMode === 'schedule') {
        const cron = generateCronFromSchedule();
        if (!cron) {
          toast.error('Please select a valid schedule date and time');
          setIsSaving(false);
          return;
        }

        payload.cronPattern = cron;
        payload.schedulerEnabled = true;
        payload.frequency = parseInt(frequency, 10) || 0;
        payload.interval = parseInt(interval, 10) || 0;
      } else {
        payload.schedulerEnabled = false;
        payload.cronPattern = '';
      }

      // Add channel order
      payload.channelOrder = channelOrder;

      await updateConfiguration(id, payload);

      toast.success('Configuration updated successfully');
      // router.push('/agents/configuration');
    } catch (error: unknown) {
      console.error('❌ Update Error:', error);
      const err = error as {
        message?: string;
        response?: { data?: { message?: string }; status?: number };
      };
      console.error('Error Details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
      });

      // More detailed error message
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to update configuration';

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="text-muted-foreground">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Configuration</h1>
          <p className="text-muted-foreground">Update your agent templates and channel settings</p>
        </div>
      </div>

      {/* Stepper */}
      <nav aria-label="Progress" className="pb-2">
        <ol className="flex items-center w-full max-w-lg">
          {steps.map((s, idx) => (
            <li
              key={s.id}
              className={`flex items-center ${idx !== steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm transition-all ${
                      currentStep > s.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : currentStep === s.id
                          ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
                          : 'border-muted-foreground/25 bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    {currentStep > s.id ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-lg font-semibold">{s.id}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${
                        currentStep >= s.id ? 'text-foreground' : 'text-muted-foreground'
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
                    currentStep > s.id ? 'bg-primary' : 'bg-muted-foreground/25'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Content */}
      <div className="flex-1">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Template selection will be available soon.
              </p>
            </div>
            <div className="flex justify-end pt-6">
              <Button onClick={handleNext}>Next Step</Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <Channel
              emailEnabled={emailEnabled}
              smsEnabled={smsEnabled}
              whatsappEnabled={whatsappEnabled}
              scheduleMode={scheduleMode}
              setScheduleMode={setScheduleMode}
              scheduledDate={scheduledDate}
              setScheduledDate={setScheduledDate}
              scheduledTime={scheduledTime}
              setScheduledTime={setScheduledTime}
              frequency={frequency}
              setFrequency={setFrequency}
              interval={interval}
              setInterval={setInterval}
              channelOrder={channelOrder}
              setChannelOrder={setChannelOrder}
            />
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
