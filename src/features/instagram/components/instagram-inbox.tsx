'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  Instagram,
  Loader2,
  MessageSquare,
  Search,
  Send,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getInstagramAccounts, getInstagramConversations, sendInstagramMessage } from '../services';
import type { InstagramAccount, InstagramConversation } from '../types';

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-8 bg-white/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <div>
        <p className="font-semibold text-lg">Select a conversation</p>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Choose a conversation from the list or search for a specific customer to start messaging.
        </p>
      </div>
    </div>
  );
}

function DirectionIcon({ direction }: { direction: 'inbound' | 'outbound' | null }) {
  if (direction === 'inbound') return <ArrowDownLeft className="h-3 w-3 text-blue-500 shrink-0" />;
  if (direction === 'outbound') return <ArrowUpRight className="h-3 w-3 text-green-500 shrink-0" />;
  return null;
}

function ConversationRow({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: InstagramConversation;
  isSelected?: boolean;
  onClick: () => void;
}) {
  const initials =
    conversation.username?.slice(0, 2).toUpperCase() ?? conversation.instagramId.slice(0, 2);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 p-4 text-left border-b transition-all focus-visible:outline-none',
        isSelected
          ? 'bg-purple-50/50 border-r-2 border-r-purple-500'
          : 'hover:bg-accent/40 bg-white',
      )}
    >
      <Avatar className="h-10 w-10 shrink-0 shadow-sm">
        <AvatarImage src={conversation.profilePic ?? undefined} alt={conversation.username ?? ''} />
        <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white text-xs font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-sm font-semibold truncate',
              isSelected ? 'text-purple-900' : 'text-foreground',
            )}
          >
            {conversation.username ?? conversation.instagramId}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 min-w-0">
          <DirectionIcon direction={conversation.lastDirection} />
          <span className="text-xs text-muted-foreground truncate italic">
            {conversation.lastMessage ?? 'No messages yet'}
          </span>
        </div>
      </div>

      {conversation.unreadCount > 0 && (
        <Badge className="h-4 min-w-4 px-1 text-[10px] bg-purple-600 hover:bg-purple-600">
          {conversation.unreadCount}
        </Badge>
      )}
    </button>
  );
}

export function InstagramInbox() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('accountId');
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<InstagramConversation | null>(null);
  const [messageText, setMessageText] = React.useState('');

  const { data: accounts = [] } = useQuery<InstagramAccount[]>({
    queryKey: ['instagram-accounts'],
    queryFn: getInstagramAccounts,
    retry: 1,
  });

  const activeAccount = accountId
    ? accounts.find((a) => a.id === accountId)
    : accounts.find((a) => a.status === 'active');

  const {
    data: conversations = [],
    isLoading,
    isError,
    error,
  } = useQuery<InstagramConversation[]>({
    queryKey: ['instagram-conversations', activeAccount?.id],
    queryFn: () => getInstagramConversations(activeAccount?.id),
    enabled: !!activeAccount,
    retry: 1,
  });

  const sendMessage = useMutation({
    mutationFn: (to: string) => {
      if (!activeAccount) throw new Error('No active account');
      return sendInstagramMessage(activeAccount.id, to, messageText);
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['instagram-conversations'] });
    },
  });

  const handleSend = () => {
    if (!selected || !messageText.trim() || sendMessage.isPending) return;
    sendMessage.mutate(selected.instagramId);
  };

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.username?.toLowerCase().includes(q) ||
      c.instagramId.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-white border rounded-2xl shadow-sm">
      {/* Sidebar: Conversation List */}
      <div className="flex w-full max-w-[320px] flex-col border-r bg-zinc-50/30">
        <div className="p-4 border-b space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Instagram className="h-5 w-5 text-purple-600" />
              Directs
            </h2>
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider">
              {activeAccount?.username || 'Account'}
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9 h-9 bg-muted/50 border-none text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 items-center opacity-40 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 bg-muted rounded" />
                    <div className="h-2 w-full bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-center">
              <p className="text-xs text-destructive font-medium">Failed to load</p>
              <p className="text-[10px] text-muted-foreground">{(error as Error)?.message}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <Instagram className="h-8 w-8 mx-auto opacity-20" />
              <p className="text-xs">No active conversations</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((conv) => (
                <ConversationRow
                  key={`${conv.instagramId}:${conv.lastMessageAt ?? ''}:${conv.lastDirection ?? ''}:${conv.lastMessage ?? ''}`}
                  conversation={conv}
                  isSelected={selected?.instagramId === conv.instagramId}
                  onClick={() => setSelected(conv)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat View */}
      <div className="flex flex-1 flex-col bg-slate-50/10">
        {!selected ? (
          <EmptyState />
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 bg-white z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border shadow-sm">
                  <AvatarImage src={selected.profilePic ?? undefined} />
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {(selected.username ?? selected.instagramId).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold">{selected.username || selected.instagramId}</h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Active on Instagram
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>

            {/* Message Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="flex flex-col gap-6 justify-end min-h-full">
                {/* Last received message (mock or real from conv) */}
                {selected.lastMessage && (
                  <div
                    className={cn(
                      'flex flex-col max-w-[80%] gap-1',
                      selected.lastDirection === 'outbound' ? 'ml-auto items-end' : 'items-start',
                    )}
                  >
                    <div
                      className={cn(
                        'group relative rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                        selected.lastDirection === 'outbound'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border text-foreground',
                      )}
                    >
                      {selected.lastMessage}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">
                      {selected.lastMessageAt &&
                        formatDistanceToNow(new Date(selected.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                )}

                <div className="py-4 text-center">
                  <Badge
                    variant="outline"
                    className="text-[10px] opacity-40 uppercase tracking-widest font-mono"
                  >
                    Conversation Details
                  </Badge>
                </div>

                <div className="flex flex-col gap-2 p-4 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/20 italic text-center">
                  <p className="text-xs text-muted-foreground">IGSID: {selected.instagramId}</p>
                </div>
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-end gap-3 max-w-4xl mx-auto border rounded-xl p-2 bg-zinc-50/50 shadow-inner focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:border-purple-200 transition-all">
                <Textarea
                  placeholder="Type a message..."
                  className="min-h-[44px] max-h-[120px] border-none bg-transparent resize-none p-3 text-sm focus-visible:ring-0 shadow-none"
                  rows={1}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shrink-0 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
