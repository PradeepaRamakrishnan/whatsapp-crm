'use client';
// import cronstrue from 'cronstrue';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { ChannelOrderItem, Configuration } from '@/features/campaigns/types';

// import { getAllConfiguration } from '@/features/campaigns/services';
// import { useQuery } from '@tanstack/react-query';

interface ChannelsProps {
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  _configuration?: Configuration;
  scheduleMode: 'now' | 'schedule';
  setScheduleMode: (mode: 'now' | 'schedule') => void;
  scheduledDate: string;
  setScheduledDate: (date: string) => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
  frequency: string;
  setFrequency: (freq: string) => void;
  interval: string;
  setInterval: (int: string) => void;
  channelOrder: ChannelOrderItem[];
  setChannelOrder: (order: ChannelOrderItem[]) => void;
}

const Channel = ({
  scheduleMode,
  setScheduleMode,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  frequency,
  setFrequency,
  interval,
  setInterval,
  channelOrder,
  setChannelOrder,
}: ChannelsProps) => {
  // Local state for delays (keep local for now as not requested to be saved yet? Or maybe they should be saved too?)
  // The user only mentioned updating schedulerEnabled and cronPattern.
  const [smsDelay, setSmsDelay] = useState('10');
  const [whatsappDelay, setWhatsappDelay] = useState('15');

  // const { data: configuration } = useQuery({
  //   queryKey: ['configurations'],
  //   queryFn: () => getAllConfiguration(),
  // });

  // const configArray = Array.isArray(configuration) ? configuration : [];
  // const firstConfig = configArray[0];

  // console.log('Templates Data:', configuration);

  const swapChannels = (index1: number, index2: number) => {
    if (index1 === 0 || index2 === 0) return;
    const newOrder = [...channelOrder];
    [newOrder[index1], newOrder[index2]] = [newOrder[index2], newOrder[index1]];
    setChannelOrder(newOrder);
  };

  return (
    <div className="space-y-6">
      {/* Header with Icon */}
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-blue-500 p-3">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Channel Timing Settings</h3>
          <p className="text-sm text-muted-foreground">
            Set delays between enabled communication channels
          </p>
        </div>
      </div>

      {/* Send Now or Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Schedule</CardTitle>
          <CardDescription>Choose when to send the campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle between Send Now and Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setScheduleMode('now')}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                scheduleMode === 'now'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-border hover:border-blue-300 dark:hover:border-blue-800'
              }`}
            >
              <Send className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold text-sm">Send Now</div>
                <div className="text-xs text-muted-foreground">Start immediately</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setScheduleMode('schedule')}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                scheduleMode === 'schedule'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-border hover:border-blue-300 dark:hover:border-blue-800'
              }`}
            >
              <Clock className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold text-sm">Schedule</div>
                <div className="text-xs text-muted-foreground">Set date & time</div>
              </div>
            </button>
          </div>

          {/* Date and Time Picker - shown when Schedule is selected */}
          {scheduleMode === 'schedule' && (
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <Field>
                <FieldLabel>Date</FieldLabel>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Time</FieldLabel>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Frequency</FieldLabel>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Interval (days)</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  placeholder="days"
                  required
                />
              </Field>

              {/* {configuration?.cronPattern && typeof configuration.cronPattern === 'string' && (
                <div className="sm:col-span-2 text-sm text-muted-foreground mt-2 bg-muted/40 p-2 rounded border">
                  Scheduled:{' '}
                  <span className="font-medium text-foreground">
                    {cronstrue.toString(configuration.cronPattern)}
                  </span>
                </div>
              )} */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timing Flow */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            {channelOrder.map((channelItem, index) => {
              const isFirst = index === 0;
              const isLast = index === channelOrder.length - 1;
              const channelConfig = {
                email: {
                  icon: Mail,
                  label: 'Email',
                  colors: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
                  iconColor: 'text-blue-600',
                },
                sms: {
                  icon: MessageSquare,
                  label: 'SMS',
                  colors: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30',
                  iconColor: 'text-green-600',
                  delay: smsDelay,
                  setDelay: setSmsDelay,
                },
                whatsapp: {
                  icon: Send,
                  label: 'WhatsApp',
                  colors:
                    'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
                  iconColor: 'text-emerald-600',
                  delay: whatsappDelay,
                  setDelay: setWhatsappDelay,
                },
              };

              const config = channelConfig[channelItem.channel];
              const Icon = config.icon;

              // Helper to update delay for this channel
              const updateChannelDelay = (newDelay: string) => {
                const newOrder = [...channelOrder];
                newOrder[index] = {
                  ...newOrder[index],
                  delayMs: parseInt(newDelay, 10) * 60 * 1000, // Convert minutes to milliseconds
                };
                setChannelOrder(newOrder);
              };

              return (
                <>
                  <div
                    key={channelItem.channel}
                    className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 ${config.colors}`}
                  >
                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                    <div>
                      <div className="font-semibold text-sm">{config.label}</div>
                      {isFirst && <div className="text-xs text-muted-foreground">(Start)</div>}
                    </div>
                    {!isFirst && (
                      <div className="flex flex-col gap-1 ml-2">
                        {index > 1 && (
                          <button
                            type="button"
                            onClick={() => swapChannels(index, index - 1)}
                            className="hover:bg-black/5 dark:hover:bg-white/5 rounded p-0.5"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                        )}
                        {!isLast && (
                          <button
                            type="button"
                            onClick={() => swapChannels(index, index + 1)}
                            className="hover:bg-black/5 dark:hover:bg-white/5 rounded p-0.5"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {!isFirst && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={Math.round(channelItem.delayMs / 60 / 1000)} // Convert ms to minutes
                        onChange={(e) => updateChannelDelay(e.target.value)}
                        className="h-10 w-20 text-center"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  )}

                  {index < channelOrder.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </>
              );
            })}

            <ArrowRight className="h-5 w-5 text-muted-foreground" />

            <div className="flex items-center gap-3 rounded-lg border-2 border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-950/30">
              <Phone className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-semibold text-sm">Call Follow-up</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="rounded-full bg-blue-500 p-1 h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How it works:</p>
              <ul className="space-y-1 text-xs">
                {channelOrder.map((item, index) => {
                  const channelNames = {
                    email: 'Email',
                    sms: 'SMS',
                    whatsapp: 'WhatsApp',
                  };
                  const delayMinutes = Math.round(item.delayMs / 60 / 1000);

                  if (index === 0) {
                    return (
                      <li key={item.channel}>
                        • Campaign starts with {channelNames[item.channel]} communication
                      </li>
                    );
                  } else {
                    return (
                      <li key={item.channel}>
                        • After {delayMinutes} minutes, {channelNames[item.channel]} will be sent to
                        recipients
                      </li>
                    );
                  }
                })}
                <li>• Call follow-up will be scheduled after all automated communications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Channel;
