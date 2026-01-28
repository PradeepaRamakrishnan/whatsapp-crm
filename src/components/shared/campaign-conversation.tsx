'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEffect, useRef } from 'react';
import { EmailMessageCard } from '@/components/shared/email-message-card';
import { MessageInput } from '@/components/shared/message-input';
import { SMSMessageCard } from '@/components/shared/sms-message-card';
import { WhatsAppMessageCard } from '@/components/shared/whatsapp-message-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getContactMessages,
  sendReplyEmail,
  sendReplySMS,
  sendReplyWhatsApp,
} from '@/features/campaigns/services';
import type { InteractionRecord, InteractionResponse } from '@/features/campaigns/types';

dayjs.extend(utc);

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
    error: m.error,
  };
}

function MessageSkeleton() {
  return (
    <div className="border rounded-lg p-3 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

function ErrorState({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-destructive">Failed to load messages</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}

export function CampaignConversation({ campaignId, contactId }: CampaignConversationProps) {
  const queryClient = useQueryClient();
  const emailScrollRef = useRef<HTMLDivElement>(null);
  const smsScrollRef = useRef<HTMLDivElement>(null);
  const whatsappScrollRef = useRef<HTMLDivElement>(null);

  // Email query
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

  // SMS query
  const {
    data: smsResponse,
    isLoading: isLoadingSms,
    error: smsError,
  } = useQuery<InteractionResponse, Error>({
    queryKey: ['contact-messages', campaignId, contactId, 'sms'],
    queryFn: () => getContactMessages(campaignId, contactId, 'sms') as Promise<InteractionResponse>,
    enabled: !!contactId,
  });

  // WhatsApp query
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

  // Email mutation
  const { mutate: sendEmail, isPending: isSending } = useMutation({
    mutationFn: (data: { subject: string; body: string }) =>
      sendReplyEmail(campaignId, contactId, data.subject, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contact-messages', campaignId, contactId, 'email'],
      });
    },
  });

  // SMS mutation
  const { mutate: sendSms, isPending: isSendingSms } = useMutation({
    mutationFn: (data: { body: string }) => sendReplySMS(campaignId, contactId, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contact-messages', campaignId, contactId, 'sms'],
      });
    },
  });

  // WhatsApp mutation
  const { mutate: sendWhatsapp, isPending: isSendingWhatsapp } = useMutation({
    mutationFn: (data: { body: string }) => sendReplyWhatsApp(campaignId, contactId, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contact-messages', campaignId, contactId, 'whatsapp'],
      });
    },
  });

  // Transform and reverse messages
  const emailMessages = emailResponse?.data
    ? [...emailResponse.data].reverse().map((m) => transformMessage(m, 'email'))
    : [];

  const smsMessages = smsResponse?.data
    ? [...smsResponse.data].reverse().map((m) => transformMessage(m, 'sms'))
    : [];

  const whatsappMessages = whatsappResponse?.data
    ? [...whatsappResponse.data].reverse().map((m) => transformMessage(m, 'whatsapp'))
    : [];

  // Auto scroll to bottom when messages load
  useEffect(() => {
    if (emailScrollRef.current) {
      setTimeout(() => {
        emailScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (smsScrollRef.current) {
      setTimeout(() => {
        smsScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (whatsappScrollRef.current) {
      setTimeout(() => {
        whatsappScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, []);

  return (
    <Tabs defaultValue="email" className="flex flex-1 flex-col overflow-hidden h-full">
      <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/30">
        <TabsList className="h-8 p-0.5 bg-muted">
          <TabsTrigger value="email" className="text-xs h-7 px-3">
            Email ({emailMessages.length})
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xs h-7 px-3">
            WhatsApp ({whatsappMessages.length})
          </TabsTrigger>
          <TabsTrigger value="sms" className="text-xs h-7 px-3">
            SMS ({smsMessages.length})
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Email Tab */}
      <TabsContent value="email" className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0">
        <ScrollArea className="flex-1">
          {isLoadingEmail ? (
            <div className="flex flex-col gap-1.5 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static loading placeholders
                <MessageSkeleton key={`email-skeleton-${i}`} />
              ))}
            </div>
          ) : emailError ? (
            <ErrorState error={emailError} />
          ) : emailMessages.length > 0 ? (
            <div className="flex flex-col gap-1.5 p-3" ref={emailScrollRef}>
              {emailMessages.map((message, index) => {
                const isFirstMessage = index === emailMessages.length - 1;
                return (
                  <Collapsible
                    key={message.id}
                    defaultOpen={isFirstMessage}
                    className="border rounded-lg"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between gap-3 w-full px-3 py-2.5 hover:bg-muted/50 transition-colors">
                      <span className="text-sm font-medium truncate text-left flex-1">
                        {message.subject || 'No Subject'}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {dayjs(message.timestamp).format('MMM DD h:mm A')}
                        </span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="border-t px-3 py-3">
                      {/* biome-ignore lint/suspicious/noExplicitAny: Message transformation adds required fields */}
                      <EmailMessageCard message={message as any} />
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold">No messages found</p>
                <p className="text-xs text-muted-foreground">No email messages for this contact</p>
              </div>
            </div>
          )}
        </ScrollArea>
        <MessageInput
          placeholder="Type your email message..."
          disabled={isSending}
          onSend={(message) => {
            const lines = message.trim().split('\n');
            const subject = lines[0] || 'No Subject';
            const body = lines.slice(1).join('\n') || lines[0];
            sendEmail({ subject, body });
          }}
        />
      </TabsContent>

      {/* WhatsApp Tab */}
      <TabsContent
        value="whatsapp"
        className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0"
      >
        <ScrollArea className="flex-1">
          {isLoadingWhatsapp ? (
            <div className="flex flex-col gap-1.5 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static loading placeholders
                <MessageSkeleton key={`whatsapp-skeleton-${i}`} />
              ))}
            </div>
          ) : whatsappError ? (
            <ErrorState error={whatsappError} />
          ) : whatsappMessages.length > 0 ? (
            <div className="flex flex-col gap-1.5 p-3" ref={whatsappScrollRef}>
              {whatsappMessages.map((message) => (
                // biome-ignore lint/suspicious/noExplicitAny: Message transformation adds required fields
                <WhatsAppMessageCard key={message.id} message={message as any} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold">No messages found</p>
                <p className="text-xs text-muted-foreground">
                  No WhatsApp messages for this contact
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
        <MessageInput
          placeholder="Type your WhatsApp message..."
          disabled={isSendingWhatsapp}
          onSend={(message) => {
            sendWhatsapp({ body: message });
          }}
        />
      </TabsContent>

      {/* SMS Tab */}
      <TabsContent value="sms" className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0">
        <ScrollArea className="flex-1">
          {isLoadingSms ? (
            <div className="flex flex-col gap-1.5 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static loading placeholders
                <MessageSkeleton key={`sms-skeleton-${i}`} />
              ))}
            </div>
          ) : smsError ? (
            <ErrorState error={smsError} />
          ) : smsMessages.length > 0 ? (
            <div className="flex flex-col gap-1.5 p-3" ref={smsScrollRef}>
              {smsMessages.map((message) => (
                // biome-ignore lint/suspicious/noExplicitAny: Message transformation adds required fields
                <SMSMessageCard key={message.id} message={message as any} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold">No messages found</p>
                <p className="text-xs text-muted-foreground">No SMS messages for this contact</p>
              </div>
            </div>
          )}
        </ScrollArea>
        <MessageInput
          placeholder="Type your SMS message..."
          disabled={isSendingSms}
          onSend={(message) => {
            sendSms({ body: message });
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
