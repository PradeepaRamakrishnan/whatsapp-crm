/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import utc from 'dayjs/plugin/utc';
import { Lock, Mail, MessageSquare, Phone, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CallMessageCard } from '@/components/shared/call-message-card';
import { EmailMessageCard } from '@/components/shared/email-message-card';
import { MessageInput } from '@/components/shared/message-input';
import { SMSMessageCard } from '@/components/shared/sms-message-card';
import { WhatsAppMessageCard } from '@/components/shared/whatsapp-message-card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  getContactMessages,
  logCallInteraction,
  sendReplyEmail,
  sendReplySMS,
  sendReplyWhatsApp,
} from '@/features/campaigns/services';
import type { InteractionRecord, InteractionResponse } from '@/features/campaigns/types';

dayjs.extend(utc);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

interface CampaignConversationProps {
  campaignId: string;
  contactId: string;
}

function transformMessage(m: InteractionRecord, channel: string = 'email') {
  return {
    id: m.id,
    sender: m.direction === 'inbound' ? 'customer' : 'agent',
    senderName: m.direction === 'inbound' ? m.contact?.customerName || 'Customer' : 'Samatva',
    content: m.body || m.subject || '',
    timestamp: m.sentAt || m.createdAt,
    channel,
    subject: m.subject,
    from: m.from,
    to: m.to,
    readAt: m.readAt,
    openedAt: m.openedAt,
    clickedAt: m.clickedAt,
    deliveredAt: m.deliveredAt,
    bouncedAt: m.bouncedAt,
    error: m.error,
    callDuration: m.callDuration,
    callOutcome: m.callOutcome,
    callNotes: m.callNotes,
  };
}

function groupMessagesByDate(messages: any[]) {
  const groups: { [key: string]: any[] } = {};
  messages.forEach((msg) => {
    const date = dayjs(msg.timestamp).format('YYYY-MM-DD');
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return groups;
}

function DateSeparator({ date, isWhatsApp = false }: { date: string; isWhatsApp?: boolean }) {
  let label = dayjs(date).format('DD/MM/YYYY');
  if (dayjs(date).isToday()) label = 'Today';
  else if (dayjs(date).isYesterday()) label = 'Yesterday';

  return (
    <div className="flex items-center justify-center my-4 sticky top-2 z-10 py-2">
      <div
        className={`px-4 py-1.5 rounded-lg text-xs font-medium shadow-xs border transition-all ${
          isWhatsApp
            ? 'bg-white text-[#54656f] border-none dark:bg-zinc-800 dark:text-zinc-400'
            : 'bg-muted/90 text-muted-foreground border-muted-foreground/10 backdrop-blur-md'
        }`}
      >
        {label}
      </div>
    </div>
  );
}

function WhatsAppEncryptionNotice() {
  return (
    <div className="flex items-center justify-center my-4 px-6 md:px-12">
      <div className="bg-[#fff9c2] dark:bg-amber-900/30 border border-transparent rounded-lg px-4 py-3 text-center max-w-lg shadow-sm">
        <p className="text-[12px] leading-relaxed text-[#54656f] dark:text-amber-200/70 flex items-center justify-center gap-1.5">
          <Lock className="h-3 w-3 inline-block -mt-0.5" />
          <span>
            Messages and calls are end-to-end encrypted. Only people in this chat can read, listen
            to, or share them. Click to learn more
          </span>
        </p>
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

function ErrorState({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center space-y-3 p-6 rounded-2xl bg-destructive/5 border border-destructive/10 max-w-sm">
        <p className="text-sm font-semibold text-destructive">Failed to load messages</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}

export function CampaignConversation({ campaignId, contactId }: CampaignConversationProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'sms' | 'call'>('email');
  const emailScrollRef = useRef<HTMLDivElement>(null);
  const smsScrollRef = useRef<HTMLDivElement>(null);
  const whatsappScrollRef = useRef<HTMLDivElement>(null);
  const callScrollRef = useRef<HTMLDivElement>(null);

  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [callDetails, setCallDetails] = useState({
    notes: '',
  });

  // Queries
  const {
    data: emailResponse,
    isLoading: isLoadingEmail,
    error: emailError,
  } = useQuery<InteractionResponse, Error>({
    queryKey: ['contact-messages', campaignId, contactId, 'email'],
    queryFn: () =>
      getContactMessages(campaignId, contactId, 'email') as Promise<InteractionResponse>,
    enabled: !!contactId,
  });

  const {
    data: smsResponse,
    isLoading: isLoadingSms,
    error: smsError,
  } = useQuery<InteractionResponse, Error>({
    queryKey: ['contact-messages', campaignId, contactId, 'sms'],
    queryFn: () => getContactMessages(campaignId, contactId, 'sms') as Promise<InteractionResponse>,
    enabled: !!contactId,
  });

  const {
    data: whatsappResponse,
    isLoading: isLoadingWhatsapp,
    error: whatsappError,
  } = useQuery<InteractionResponse, Error>({
    queryKey: ['contact-messages', campaignId, contactId, 'whatsapp'],
    queryFn: () =>
      getContactMessages(campaignId, contactId, 'whatsapp') as Promise<InteractionResponse>,
    enabled: !!contactId,
  });

  const {
    data: callsQueryResult,
    isLoading: isLoadingCalls,
    error: callsError,
  } = useQuery<InteractionResponse, Error>({
    queryKey: ['contact-messages', campaignId, contactId, 'call'],
    queryFn: () =>
      getContactMessages(campaignId, contactId, 'call') as Promise<InteractionResponse>,
    enabled: !!contactId,
  });

  // Mutations
  const { mutate: sendEmail, isPending: isSending } = useMutation({
    mutationFn: (data: { subject: string; body: string }) =>
      sendReplyEmail(campaignId, contactId, data.subject, data.body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['contact-messages', campaignId, contactId, 'email'],
      }),
  });

  const { mutate: sendSms, isPending: isSendingSms } = useMutation({
    mutationFn: (data: { body: string }) => sendReplySMS(campaignId, contactId, data.body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['contact-messages', campaignId, contactId, 'sms'],
      }),
  });

  const { mutate: sendWhatsapp, isPending: isSendingWhatsapp } = useMutation({
    mutationFn: (data: { body: string }) => sendReplyWhatsApp(campaignId, contactId, data.body),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['contact-messages', campaignId, contactId, 'whatsapp'],
      }),
  });

  const { mutate: logCall, isPending: isLoggingCall } = useMutation({
    mutationFn: (data: { notes: string }) => logCallInteraction(campaignId, contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contact-messages', campaignId, contactId, 'call'],
      });
      setIsLogCallOpen(false);
      setCallDetails({ notes: '' });
    },
  });

  // Transform messages
  const emailGroups = useMemo(() => {
    const messages = emailResponse?.data
      ? [...emailResponse.data].reverse().map((m) => transformMessage(m, 'email'))
      : [];
    return groupMessagesByDate(messages);
  }, [emailResponse]);

  const smsGroups = useMemo(() => {
    const messages = smsResponse?.data
      ? [...smsResponse.data].reverse().map((m) => transformMessage(m, 'sms'))
      : [];
    return groupMessagesByDate(messages);
  }, [smsResponse]);

  const whatsappGroups = useMemo(() => {
    const messages = whatsappResponse?.data
      ? [...whatsappResponse.data].reverse().map((m) => transformMessage(m, 'whatsapp'))
      : [];
    return groupMessagesByDate(messages);
  }, [whatsappResponse]);

  const callsGroups = useMemo(() => {
    const messages = callsQueryResult?.data
      ? [...callsQueryResult.data].reverse().map((m) => transformMessage(m, 'call'))
      : [];
    return groupMessagesByDate(messages);
  }, [callsQueryResult]);

  const emailCount = Object.values(emailGroups).flat().length;
  const smsCount = Object.values(smsGroups).flat().length;
  const whatsappCount = Object.values(whatsappGroups).flat().length;
  const callsCount = Object.values(callsGroups).flat().length;

  const scrollToBottom = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Scroll to bottom when messages change or tab changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'email') scrollToBottom(emailScrollRef);
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, scrollToBottom, emailGroups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'sms') scrollToBottom(smsScrollRef);
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, scrollToBottom, smsGroups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'whatsapp') scrollToBottom(whatsappScrollRef);
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, scrollToBottom, whatsappGroups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'call') scrollToBottom(callScrollRef);
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, scrollToBottom, callsGroups]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-full">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card z-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-semibold whitespace-nowrap ${
              activeTab === 'email'
                ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                : 'bg-muted/30 border-muted-foreground/10 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
            <span className="opacity-60 font-medium">({emailCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-semibold whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
                : 'bg-muted/30 border-muted-foreground/10 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>WhatsApp</span>
            <span className="opacity-60 font-medium">({whatsappCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-semibold whitespace-nowrap ${
              activeTab === 'sms'
                ? 'bg-sky-50 text-sky-600 border-sky-200 shadow-sm'
                : 'bg-muted/30 border-muted-foreground/10 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <span>SMS</span>
            <span className="opacity-60 font-medium">({smsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('call')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-semibold whitespace-nowrap ${
              activeTab === 'call'
                ? 'bg-purple-50 text-purple-600 border-purple-200 shadow-sm'
                : 'bg-muted/30 border-muted-foreground/10 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-purple-500" />
            <span>Calls</span>
            <span className="opacity-60 font-medium">({callsCount})</span>
          </button>
        </div>

        {activeTab === 'call' && (
          <Dialog open={isLogCallOpen} onOpenChange={setIsLogCallOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto gap-2">
                <Plus className="w-4 h-4" />
                Log Call
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Call Note</DialogTitle>
                <DialogDescription>
                  Record a quick note about your call with the customer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Type call details here..."
                    className="min-h-[100px]"
                    value={callDetails.notes}
                    onChange={(e) => setCallDetails({ ...callDetails, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() =>
                    logCall({
                      notes: callDetails.notes,
                    })
                  }
                  disabled={isLoggingCall || !callDetails.notes.trim()}
                >
                  {isLoggingCall ? 'Saving...' : 'Save Note'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Content Area */}
      {['email', 'whatsapp', 'sms', 'call'].map((tab) => {
        if (tab !== activeTab) return null;

        const groups =
          tab === 'email'
            ? emailGroups
            : tab === 'whatsapp'
              ? whatsappGroups
              : tab === 'sms'
                ? smsGroups
                : callsGroups;
        const isLoading =
          tab === 'email'
            ? isLoadingEmail
            : tab === 'whatsapp'
              ? isLoadingWhatsapp
              : tab === 'sms'
                ? isLoadingSms
                : isLoadingCalls;
        const error =
          tab === 'email'
            ? emailError
            : tab === 'whatsapp'
              ? whatsappError
              : tab === 'sms'
                ? smsError
                : callsError;
        const scrollRef =
          tab === 'email'
            ? emailScrollRef
            : tab === 'whatsapp'
              ? whatsappScrollRef
              : tab === 'sms'
                ? smsScrollRef
                : callScrollRef;
        const isSendingLocal =
          tab === 'email' ? isSending : tab === 'whatsapp' ? isSendingWhatsapp : isSendingSms;
        const isWhatsApp = tab === 'whatsapp';

        return (
          <div key={tab} className={`flex-1 flex flex-col overflow-hidden relative `}>
            {/* WhatsApp Background Doodle Pattern */}
            {isWhatsApp && (
              <div
                className="absolute inset-0 opacity-[0.6] pointer-events-none dark:opacity-[0.1]"
                style={{
                  backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '400px',
                  mixBlendMode: 'multiply',
                }}
              />
            )}

            <ScrollArea className="flex-1 relative z-10">
              <div className="p-4 lg:p-6 max-w-4xl mx-auto w-full">
                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {['skeleton-1', 'skeleton-2', 'skeleton-3'].map((skeletonId) => (
                      <MessageSkeleton key={`${tab}-${skeletonId}`} />
                    ))}
                  </div>
                ) : error ? (
                  <ErrorState error={error} />
                ) : Object.keys(groups).length > 0 ? (
                  <div className="flex flex-col">
                    {isWhatsApp && <WhatsAppEncryptionNotice />}
                    {Object.entries(groups).map(([date, msgs]) => (
                      <div key={date}>
                        <DateSeparator date={date} isWhatsApp={isWhatsApp} />
                        <div className="flex flex-col gap-1">
                          {msgs.map((message, index) => {
                            if (tab === 'email') {
                              const isLastInGroup = index === msgs.length - 1;
                              return (
                                <Collapsible
                                  key={message.id}
                                  defaultOpen={isLastInGroup}
                                  className="mb-2 border rounded-xl bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
                                >
                                  <CollapsibleTrigger className="flex items-center justify-between gap-4 w-full px-5 py-4 hover:bg-muted/20 text-left transition-colors">
                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                        {message.sender === 'agent'
                                          ? 'Samatva Support'
                                          : message.senderName}
                                      </span>
                                      <span className="text-sm font-semibold truncate leading-tight">
                                        {message.subject || 'No Subject'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full font-medium">
                                        {dayjs(message.timestamp).format('h:mm A')}
                                      </span>
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="border-t bg-muted/5">
                                    <div className="p-5  text-muted-foreground">
                                      {/* biome-ignore lint/suspicious/noExplicitAny: Message transformation adds required fields */}
                                      <EmailMessageCard message={message} />
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            }
                            if (isWhatsApp)
                              return <WhatsAppMessageCard key={message.id} message={message} />;
                            if (tab === 'call')
                              return <CallMessageCard key={message.id} message={message} />;
                            return <SMSMessageCard key={message.id} message={message} />;
                          })}
                        </div>
                      </div>
                    ))}
                    <div ref={scrollRef} className="h-px" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <div className="p-6 rounded-full bg-muted/40 mb-4 animate-in zoom-in-50 duration-300">
                      {tab === 'email' ? (
                        <Mail className="w-8 h-8 text-primary/60" />
                      ) : tab === 'call' ? (
                        <Phone className="w-8 h-8 text-primary/60" />
                      ) : (
                        <MessageSquare className="w-8 h-8 text-primary/60" />
                      )}
                    </div>
                    <p className="text-base font-bold text-foreground">
                      No {tab === 'call' ? 'calls' : 'conversation'} found
                    </p>
                    <p className="text-sm mt-1 max-w-[200px] text-center opacity-70">
                      {tab === 'call'
                        ? 'Log your first call to start tracking.'
                        : 'Send the first message to start the conversation.'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {tab !== 'call' && (
              <div className="border-t bg-background p-4 relative z-10 items-center justify-center flex">
                <div className="max-w-4xl w-full">
                  <MessageInput
                    placeholder={`Send ${tab === 'whatsapp' ? 'a WhatsApp message' : tab === 'sms' ? 'an SMS' : 'an Email'}...`}
                    disabled={isSendingLocal}
                    onSend={(msg) => {
                      if (tab === 'email') {
                        const lines = msg.trim().split('\n');
                        const subject = lines[0] || 'No Subject';
                        const body = lines.slice(1).join('\n') || lines[0];
                        sendEmail({ subject, body });
                      } else if (tab === 'whatsapp') {
                        sendWhatsapp({ body: msg });
                      } else {
                        sendSms({ body: msg });
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
