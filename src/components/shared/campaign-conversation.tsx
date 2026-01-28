'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useMemo } from 'react';
import { ChannelEmptyState } from '@/components/shared/channel-empty-state';
import type { ConversationMessage } from '@/components/shared/conversation-view';
import { EmailMessageCard } from '@/components/shared/email-message-card';
import { MessageInput } from '@/components/shared/message-input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getContactMessages, sendReplyEmail } from '@/features/campaigns/services';
import type { InteractionRecord, InteractionResponse } from '@/features/campaigns/types';

dayjs.extend(utc);

interface CampaignConversationProps {
  campaignId: string;
  contactId: string;
}

export function CampaignConversation({ campaignId, contactId }: CampaignConversationProps) {
  const queryClient = useQueryClient();

  const { data: messagesResponse, isLoading } = useQuery<InteractionResponse | InteractionRecord[]>(
    {
      queryKey: ['contact-messages', campaignId, contactId],
      queryFn: () =>
        getContactMessages(campaignId, contactId) as Promise<
          InteractionResponse | InteractionRecord[]
        >,
      enabled: !!contactId,
    },
  );

  const { mutate: sendEmail, isPending: isSending } = useMutation({
    mutationFn: (data: { subject: string; body: string }) =>
      sendReplyEmail(campaignId, contactId, data.subject, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contact-messages', campaignId, contactId],
      });
    },
  });

  const msgList = useMemo(() => {
    if (Array.isArray(messagesResponse)) {
      return messagesResponse;
    }
    if (messagesResponse && typeof messagesResponse === 'object' && 'data' in messagesResponse) {
      const data = (messagesResponse as InteractionResponse).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [messagesResponse]);

  const emailMessages = useMemo(() => {
    return msgList
      .filter((m: InteractionRecord) => m.channel === 'email' && m.id)
      .map((m: InteractionRecord) => ({
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
    >;
  }, [msgList]);

  if (isLoading) {
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
            Email
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="email" className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0">
        <ScrollArea className="flex-1">
          {emailMessages.length > 0 ? (
            <div className="flex flex-col gap-1.5 p-3">
              {emailMessages.map((message, index) => {
                const isLatestMessage = index === 0;
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
    </Tabs>
  );
}
