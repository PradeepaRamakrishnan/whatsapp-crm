/* biome-ignore-all lint/style/useNamingConvention: API response uses snake_case */
'use client';

import dayjs from 'dayjs';
import { CheckCircle2, Mail, MessageSquare, Phone, RotateCcw, Send, X } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

export type MessageChannel = 'whatsapp' | 'email' | 'sms' | 'call';

export type MessageSender = 'customer' | 'agent';

export interface ConversationMessage {
  id: string;
  sender: MessageSender;
  senderName: string;
  channel: MessageChannel;
  content: string;
  timestamp: string;
  deliveredAt?: string | null;
  bouncedAt?: string | null;
  showActions?: boolean;
}

export interface ConversationContact {
  id: string;
  name: string;
  phone: string;
  bankName: string;
  outstandingAmount: number;
}

interface ConversationViewProps {
  contact: ConversationContact;
  messages?: ConversationMessage[];
  onSendMessage?: (message: string, channel: MessageChannel) => void;
  onCall?: () => void;
  onEmail?: () => void;
  onComplete?: () => void;
  onInterested?: () => void;
  onNotInterested?: () => void;
  onFollowUp?: () => void;
  filterChannel?: MessageChannel;
}

const getChannelIcon = (channel: MessageChannel) => {
  switch (channel) {
    case 'whatsapp':
      return <MessageSquare className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'sms':
      return <MessageSquare className="h-4 w-4" />;
    case 'call':
      return <Phone className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getChannelColor = (channel: MessageChannel) => {
  switch (channel) {
    case 'whatsapp':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'email':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'sms':
      return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
    case 'call':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
  }
};

// FIXED: Added null/undefined checks
const getInitials = (name?: string) => {
  if (!name || typeof name !== 'string') {
    return 'NA';
  }

  return (
    name
      .trim()
      .split(' ')
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'NA'
  );
};

export function ConversationView({
  contact,
  messages: propMessages,
  onSendMessage,
  onInterested,
  onNotInterested,
  onFollowUp,
  filterChannel,
}: ConversationViewProps) {
  const [selectedChannel, setSelectedChannel] = React.useState<MessageChannel | 'all'>(
    filterChannel || 'all',
  );
  const [messageInput, setMessageInput] = React.useState('');

  // FIXED: Added safety checks for contact
  if (!contact) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No contact selected</p>
      </div>
    );
  }

  // Mock data if no messages provided
  const defaultMessages: ConversationMessage[] = [
    {
      id: '1',
      sender: 'customer',
      senderName: contact.name || 'Customer',
      channel: 'sms',
      content: 'That would be great. What are my options?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      showActions: true,
    },
    {
      id: '2',
      sender: 'agent',
      senderName: 'Agent',
      channel: 'sms',
      content:
        'We can offer:\n1. Full settlement with 15% discount\n2. 3-month EMI plan at 0% interest\n3. 6-month extended plan with minimal interest\n\nWhich option works best for you?',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      sender: 'customer',
      senderName: contact.name || 'Customer',
      channel: 'whatsapp',
      content: 'I would like to know more about option 2.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      sender: 'agent',
      senderName: 'Agent',
      channel: 'whatsapp',
      content:
        'Great choice! The 3-month EMI plan at 0% interest means you can pay ₹5,000 per month for 3 months. No additional charges or interest. Would you like to proceed?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ];

  const messages = propMessages || defaultMessages;

  const filteredMessages =
    selectedChannel === 'all'
      ? messages
      : messages.filter((msg) => msg.channel === selectedChannel);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !onSendMessage) return;

    const channel: MessageChannel = selectedChannel === 'all' ? 'sms' : selectedChannel;
    onSendMessage(messageInput, channel);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col bg-background min-h-0">
      {/* Compact Header */}
      {/* <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate">{contact.name || 'Unknown'}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{contact.phone || 'N/A'}</span>
                <span>•</span>
                <span className="truncate">{contact.bankName || 'N/A'}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <IndianRupee className="h-3 w-3" />
                  {(contact.outstandingAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon-sm" onClick={onCall} title="Call">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onEmail} title="Email">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onComplete} title="Complete">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div> */}

      {/* Compact Channel Filters */}
      {!filterChannel && (
        <div className="border-b bg-muted/20 px-4 py-2">
          <div className="flex items-center gap-1">
            <Button
              variant={selectedChannel === 'all' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSelectedChannel('all')}
            >
              All
            </Button>
            <Button
              variant={selectedChannel === 'whatsapp' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSelectedChannel('whatsapp')}
            >
              WhatsApp
            </Button>
            <Button
              variant={selectedChannel === 'email' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSelectedChannel('email')}
            >
              Email
            </Button>
            <Button
              variant={selectedChannel === 'sms' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSelectedChannel('sms')}
            >
              SMS
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="flex flex-col gap-3">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.sender === 'agent' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback
                  className={
                    message.sender === 'agent'
                      ? 'bg-primary text-primary-foreground text-xs'
                      : 'bg-muted text-xs'
                  }
                >
                  {getInitials(message.senderName)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col gap-1 max-w-[75%] ${
                  message.sender === 'agent' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs text-muted-foreground">
                    {message.sender === 'agent' ? 'You' : message.senderName || 'Customer'}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${getChannelColor(message.channel)}`}
                  >
                    {getChannelIcon(message.channel)}
                    <span className="ml-0.5 capitalize">{message.channel}</span>
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {dayjs(message.timestamp).format('h:mm A')}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.sender === 'agent'
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.channel === 'email' && message.content.includes('<') ? (
                    <div
                      className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-full overflow-x-auto"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: <Used for rendering email HTML content>
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>
                {message.showActions && message.sender === 'customer' && (
                  <div className="mt-1.5 flex gap-1.5">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 bg-emerald-600 px-2 text-xs hover:bg-emerald-700"
                      onClick={onInterested}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="ml-1">Interested</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 bg-orange-600 px-2 text-xs hover:bg-orange-700"
                      onClick={onNotInterested}
                    >
                      <X className="h-3 w-3" />
                      <span className="ml-1">Not Interested</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 bg-purple-600 px-2 text-xs hover:bg-purple-700"
                      onClick={onFollowUp}
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span className="ml-1">Follow-up</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t bg-card px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[50px] resize-none text-sm"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="h-[50px] w-[50px] shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
