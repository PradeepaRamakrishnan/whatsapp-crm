'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useCallback, useMemo, useRef } from 'react';
import { ChannelEmptyState } from '@/components/shared/channel-empty-state';
import type { ConversationMessage } from '@/components/shared/conversation-view';
import { EmailMessageCard } from '@/components/shared/email-message-card';
import { MessageInput } from '@/components/shared/message-input';
import { SMSMessageCard } from '@/components/shared/sms-message-card';
import { WhatsAppMessageCard } from '@/components/shared/whatsapp-message-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const MESSAGES_PER_PAGE = 3;

export function CampaignConversation({ campaignId, contactId }: CampaignConversationProps) {
  const queryClient = useQueryClient();
  const scrollEmailRef = useRef<HTMLDivElement>(null);
  const scrollSmsRef = useRef<HTMLDivElement>(null);
  const scrollWhatsappRef = useRef<HTMLDivElement>(null);

  // Email infinite query
  const {
    data: emailData,
    fetchNextPage: fetchNextEmail,
    hasNextPage: hasNextEmail,
    isFetchingNextPage: isFetchingNextEmail,
    isLoading: isLoadingEmail,
  } = useInfiniteQuery<InteractionResponse>({
    queryKey: ['contact-messages', campaignId, contactId, 'email'],
    queryFn: ({ pageParam = 1 }) =>
      getContactMessages(campaignId, contactId, {
        page: pageParam as number,
        limit: MESSAGES_PER_PAGE,
        channel: 'email',
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.total / MESSAGES_PER_PAGE);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!contactId,
    initialPageParam: 1,
  });

  // SMS infinite query
  const {
    data: smsData,
    fetchNextPage: fetchNextSms,
    hasNextPage: hasNextSms,
    isFetchingNextPage: isFetchingNextSms,
    isLoading: isLoadingSms,
  } = useInfiniteQuery<InteractionResponse>({
    queryKey: ['contact-messages', campaignId, contactId, 'sms'],
    queryFn: ({ pageParam = 1 }) =>
      getContactMessages(campaignId, contactId, {
        page: pageParam as number,
        limit: MESSAGES_PER_PAGE,
        channel: 'sms',
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.total / MESSAGES_PER_PAGE);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!contactId,
    initialPageParam: 1,
  });

  // WhatsApp infinite query
  const {
    data: whatsappData,
    fetchNextPage: fetchNextWhatsapp,
    hasNextPage: hasNextWhatsapp,
    isFetchingNextPage: isFetchingNextWhatsapp,
    isLoading: isLoadingWhatsapp,
  } = useInfiniteQuery<InteractionResponse>({
    queryKey: ['contact-messages', campaignId, contactId, 'whatsapp'],
    queryFn: ({ pageParam = 1 }) =>
      getContactMessages(campaignId, contactId, {
        page: pageParam as number,
        limit: MESSAGES_PER_PAGE,
        channel: 'whatsapp',
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.total / MESSAGES_PER_PAGE);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!contactId,
    initialPageParam: 1,
  });

  // Email mutations
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

  // Transform email messages
  const emailMessages = useMemo(() => {
    if (!emailData) return [];
    return emailData.pages.flatMap(
      (page) =>
        page.data.map((m: InteractionRecord) => ({
          id: m.id,
          sender: m.direction === 'inbound' ? 'customer' : 'agent',
          senderName: m.direction === 'inbound' ? m.contact?.customerName || 'Customer' : 'Samatva',
          channel: 'email',
          content: m.body || m.subject || '',
          timestamp: m.sentAt || m.createdAt,
          subject: m.subject,
          from: m.from,
          to: m.to,
          readAt: m.readAt,
          openedAt: m.openedAt,
          clickedAt: m.clickedAt,
          error: m.error,
        })) as Array<
          ConversationMessage & {
            subject?: string | null;
            from?: string;
            to?: string;
            readAt?: string | null;
            openedAt?: string | null;
            clickedAt?: string | null;
            error?: string | null;
          }
        >,
    );
  }, [emailData]);

  // Transform SMS messages
  const smsMessages = useMemo(() => {
    if (!smsData) return [];
    return smsData.pages.flatMap(
      (page) =>
        page.data.map((m: InteractionRecord) => ({
          id: m.id,
          sender: m.direction === 'inbound' ? 'customer' : 'agent',
          senderName: m.direction === 'inbound' ? m.contact?.customerName || 'Customer' : 'Samatva',
          channel: 'sms',
          content: m.body || '',
          timestamp: m.sentAt || m.createdAt,
          from: m.from,
          to: m.to,
          error: m.error,
        })) as Array<
          ConversationMessage & {
            from?: string;
            to?: string;
            error?: string | null;
          }
        >,
    );
  }, [smsData]);

  // Transform WhatsApp messages
  const whatsappMessages = useMemo(() => {
    if (!whatsappData) return [];
    return whatsappData.pages.flatMap(
      (page) =>
        page.data.map((m: InteractionRecord) => ({
          id: m.id,
          sender: m.direction === 'inbound' ? 'customer' : 'agent',
          senderName: m.direction === 'inbound' ? m.contact?.customerName || 'Customer' : 'Samatva',
          channel: 'whatsapp',
          content: m.body || '',
          timestamp: m.sentAt || m.createdAt,
          from: m.from,
          to: m.to,
          error: m.error,
        })) as Array<
          ConversationMessage & {
            from?: string;
            to?: string;
            error?: string | null;
          }
        >,
    );
  }, [whatsappData]);

  // Scroll handlers for infinite scroll
  const handleEmailScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;

      if (isNearBottom && hasNextEmail && !isFetchingNextEmail) {
        fetchNextEmail();
      }
    },
    [hasNextEmail, isFetchingNextEmail, fetchNextEmail],
  );

  const handleSmsScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;

      if (isNearBottom && hasNextSms && !isFetchingNextSms) {
        fetchNextSms();
      }
    },
    [hasNextSms, isFetchingNextSms, fetchNextSms],
  );

  const handleWhatsappScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;

      if (isNearBottom && hasNextWhatsapp && !isFetchingNextWhatsapp) {
        fetchNextWhatsapp();
      }
    },
    [hasNextWhatsapp, isFetchingNextWhatsapp, fetchNextWhatsapp],
  );

  if (isLoadingEmail || isLoadingSms || isLoadingWhatsapp) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="email" className="flex flex-1 flex-col overflow-hidden h-full">
      <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/30">
        <TabsList className="h-8 p-0.5 bg-muted">
          <TabsTrigger value="email" className="text-xs h-7 px-3">
            Email ({emailData?.pages[0]?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="sms" className="text-xs h-7 px-3">
            SMS ({smsData?.pages[0]?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xs h-7 px-3">
            WhatsApp ({whatsappData?.pages[0]?.total || 0})
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Email Tab */}
      <TabsContent value="email" className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0">
        <ScrollArea ref={scrollEmailRef} className="flex-1" onScrollCapture={handleEmailScroll}>
          {emailMessages.length > 0 ? (
            <div className="flex flex-col gap-1.5 p-3">
              {emailMessages
                .slice()
                .reverse()
                .map((message, index, arr) => {
                  const isLatestMessage = index === arr.length - 1;
                  return (
                    <Collapsible
                      key={message.id}
                      defaultOpen={isLatestMessage}
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
                        <EmailMessageCard message={message} />
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              {isFetchingNextEmail && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Loading more messages...
                </div>
              )}
            </div>
          ) : (
            <ChannelEmptyState channel="email" />
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

      {/* SMS Tab */}
      <TabsContent value="sms" className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0">
        <ScrollArea ref={scrollSmsRef} className="flex-1" onScrollCapture={handleSmsScroll}>
          {smsMessages.length > 0 ? (
            <div className="flex flex-col gap-1.5 p-3">
              {smsMessages.map((message) => (
                <SMSMessageCard key={message.id} message={message} />
              ))}
              {isFetchingNextSms && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Loading more messages...
                </div>
              )}
            </div>
          ) : (
            <ChannelEmptyState channel="sms" />
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

      {/* WhatsApp Tab */}
      <TabsContent
        value="whatsapp"
        className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0"
      >
        <ScrollArea
          ref={scrollWhatsappRef}
          className="flex-1"
          onScrollCapture={handleWhatsappScroll}
        >
          {whatsappMessages.length > 0 ? (
            <div className="flex flex-col gap-1.5 p-3">
              {whatsappMessages.map((message) => (
                <WhatsAppMessageCard key={message.id} message={message} />
              ))}
              {isFetchingNextWhatsapp && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Loading more messages...
                </div>
              )}
            </div>
          ) : (
            <ChannelEmptyState channel="whatsapp" />
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
    </Tabs>
  );
}
