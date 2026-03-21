'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  RefreshCw,
  Reply,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  getEmailConversations,
  getEmailMessages,
  listEmailAccounts,
  sendEmail,
  syncEmailAccount,
} from '../services';
import type { EmailAccount, EmailConversation, EmailMessage } from '../types';

function getInitials(email: string) {
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function EmailInbox() {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery<EmailAccount[]>({
    queryKey: ['email-accounts'],
    queryFn: listEmailAccounts,
    retry: 1,
    onSuccess: (data: EmailAccount[]) => {
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0].id);
      }
    },
  } as Parameters<typeof useQuery<EmailAccount[]>>[0]);

  const {
    data: conversations = [],
    isLoading: convLoading,
    isRefetching: convRefetching,
  } = useQuery<EmailConversation[]>({
    queryKey: ['email-conversations', selectedAccount],
    queryFn: () => getEmailConversations(selectedAccount),
    enabled: !!selectedAccount,
    retry: 1,
  });

  const { data: messages = [], isLoading: msgLoading } = useQuery<EmailMessage[]>({
    queryKey: ['email-messages', selectedAccount, selectedContact],
    queryFn: () => getEmailMessages(selectedAccount, selectedContact as string),
    enabled: !!selectedAccount && !!selectedContact,
    retry: 1,
  });

  const filteredConversations = conversations.filter(
    (c) =>
      c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastSubject.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentAccount = accounts.find((a) => a.id === selectedAccount);

  const handleSendReply = async () => {
    if (!replyBody.trim() || !replyTo.trim() || !selectedAccount) return;
    setSending(true);
    setSendError('');
    try {
      await sendEmail({
        accountId: selectedAccount,
        to: replyTo.trim(),
        subject: replySubject || `Re: ${messages[0]?.subject ?? ''}`,
        html: `<p>${replyBody.replace(/\n/g, '<br>')}</p>`,
        text: replyBody,
      });
      setReplyBody('');
      setReplySubject('');
      queryClient.invalidateQueries({
        queryKey: ['email-messages', selectedAccount, selectedContact],
      });
      queryClient.invalidateQueries({ queryKey: ['email-conversations', selectedAccount] });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedAccount) return;
    setSyncing(true);
    try {
      await syncEmailAccount(selectedAccount);
    } catch {
      // sync errors are non-fatal — still refresh UI
    } finally {
      setSyncing(false);
    }
    queryClient.invalidateQueries({ queryKey: ['email-conversations', selectedAccount] });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel: Conversations */}
      {isSidebarOpen && (
        <div className="w-80 border-r flex flex-col shrink-0 bg-muted/20">
          {/* Account selector */}
          <div className="p-3 border-b space-y-3">
            <Select
              value={selectedAccount}
              onValueChange={(v) => {
                if (v) setSelectedAccount(v);
                setSelectedContact(null);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select email account..." />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.fromEmail}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Input
                placeholder="Search conversations..."
                className="h-8 pl-3 text-sm bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {filteredConversations.length} conversations
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRefresh}
                disabled={convLoading || convRefetching || syncing}
              >
                <RefreshCw
                  className={cn(
                    'h-3 w-3',
                    (convLoading || convRefetching || syncing) && 'animate-spin',
                  )}
                />
              </Button>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {!selectedAccount ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4 text-center">
                <Inbox className="h-10 w-10 opacity-30" />
                <p className="text-sm">Select an email account to view conversations</p>
              </div>
            ) : convLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2 p-4 text-center">
                <Inbox className="h-8 w-8 opacity-30" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  type="button"
                  key={conv.contactEmail}
                  onClick={() => {
                    setSelectedContact(conv.contactEmail);
                    setReplyTo(conv.contactEmail);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b hover:bg-muted/40 transition-colors',
                    selectedContact === conv.contactEmail && 'bg-muted',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(conv.contactEmail)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium truncate">{conv.contactEmail}</span>
                        {conv.lastAt && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatDate(conv.lastAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastSubject}</p>
                      <p className="text-xs text-muted-foreground/80 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.count > 1 && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {conv.count}
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Right Panel: Messages + Composer */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedContact ? (
          <>
            <div className="border-b px-3 py-2 bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                title={isSidebarOpen ? 'Hide conversations' : 'Show conversations'}
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-3">
              <Reply className="h-14 w-14 opacity-20" />
              <p className="text-lg font-medium opacity-40">Select a conversation</p>
            </div>
          </>
        ) : (
          <>
            {/* Conversation header */}
            <div className="border-b px-6 py-3 flex items-center gap-4 bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                title={isSidebarOpen ? 'Hide conversations' : 'Show conversations'}
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => setSelectedContact(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(selectedContact)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{selectedContact}</p>
                {currentAccount && (
                  <p className="text-xs text-muted-foreground">via {currentAccount.fromEmail}</p>
                )}
              </div>
            </div>

            {/* Messages thread */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {msgLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                  No messages yet
                </div>
              ) : (
                messages.map((msg) => {
                  const isOutbound = msg.direction === 'outbound';

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex w-full items-end gap-3',
                        isOutbound ? 'justify-end' : 'justify-start',
                      )}
                    >
                      {!isOutbound && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                            {getInitials(msg.from)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          'flex max-w-[min(80%,42rem)] min-w-0 flex-col',
                          isOutbound ? 'items-end' : 'items-start',
                        )}
                      >
                        {msg.subject && (
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            {msg.subject}
                          </p>
                        )}

                        <div
                          className={cn(
                            'w-full break-words overflow-hidden rounded-2xl px-4 py-3 text-sm shadow-sm',
                            isOutbound
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-muted rounded-tl-sm',
                          )}
                        >
                          {msg.bodyHtml ? (
                            <div
                              // biome-ignore lint/security/noDangerouslySetInnerHtml: email HTML rendering is intentional
                              // biome-ignore lint/style/useNamingConvention: React API requires __html key
                              dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                              className="prose prose-sm max-w-none break-words [&_*]:max-w-full"
                            />
                          ) : (
                            <p className="whitespace-pre-wrap break-words">{msg.bodyText}</p>
                          )}
                        </div>

                        {msg.createdAt && (
                          <span className="mt-1 text-[10px] text-muted-foreground">
                            {formatDate(msg.createdAt)} · {msg.status}
                          </span>
                        )}
                      </div>

                      {isOutbound && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            ME
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Compose reply */}
            <div className="border-t px-6 py-4 bg-background space-y-3">
              <Input
                placeholder="To"
                type="email"
                value={replyTo}
                disabled
                onChange={(e) => setReplyTo(e.target.value)}
                className="h-8 text-sm"
              />
              <Input
                placeholder="Subject (optional)"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="h-8 text-sm"
              />
              <Textarea
                placeholder="Write a reply..."
                className="resize-none text-sm min-h-[80px]"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendReply();
                }}
              />
              {sendError && <p className="text-xs text-destructive">{sendError}</p>}
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Ctrl+Enter to send</p>
                <Button size="sm" onClick={handleSendReply} disabled={sending || !replyBody.trim()}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
