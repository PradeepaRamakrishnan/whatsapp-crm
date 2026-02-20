'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Instagram, MessageSquare, Search } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getInstagramAccounts, getInstagramConversations } from '../services';
import type { InstagramAccount, InstagramConversation } from '../types';
import { SendMessageDialog } from './send-message-dialog';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">No conversations yet</p>
        <p className="text-sm text-muted-foreground">
          Messages received via Instagram webhook will appear here.
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
  account,
  onClick,
}: {
  conversation: InstagramConversation;
  account: InstagramAccount;
  onClick: () => void;
}) {
  const initials =
    conversation.username?.slice(0, 2).toUpperCase() ?? conversation.instagramId.slice(0, 2);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent hover:border-accent-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarImage src={conversation.profilePic ?? undefined} alt={conversation.username ?? ''} />
        <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate">
            {conversation.username ?? conversation.instagramId}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {conversation.unreadCount > 0 && (
              <Badge className="h-5 min-w-5 px-1.5 text-xs bg-purple-600 hover:bg-purple-600">
                {conversation.unreadCount}
              </Badge>
            )}
            {conversation.lastMessageAt && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 min-w-0">
          <DirectionIcon direction={conversation.lastDirection} />
          <span className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage ?? 'No messages yet'}
          </span>
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          via {account.username || account.instagramId}
        </p>
      </div>

      <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

export function InstagramInbox() {
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<{
    conversation: InstagramConversation;
    account: InstagramAccount;
  } | null>(null);

  const { data: accounts = [] } = useQuery<InstagramAccount[]>({
    queryKey: ['instagram-accounts'],
    queryFn: getInstagramAccounts,
    retry: 1,
  });

  const firstActiveAccount = accounts.find((a) => a.status === 'active');

  const {
    data: conversations = [],
    isLoading,
    isError,
    error,
  } = useQuery<InstagramConversation[]>({
    queryKey: ['instagram-conversations', firstActiveAccount?.id],
    queryFn: () => getInstagramConversations(firstActiveAccount?.id),
    enabled: !!firstActiveAccount,
    retry: 1,
  });

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.username?.toLowerCase().includes(q) ||
      c.instagramId.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
          <Instagram className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instagram Inbox</h1>
          <p className="text-muted-foreground">Messages from your connected Instagram accounts</p>
        </div>
      </div>

      {/* Search */}
      {conversations.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or message…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load conversations: {(error as Error)?.message ?? 'Unknown error'}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* No active account */}
      {!isLoading && !firstActiveAccount && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Instagram className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No active accounts</p>
            <p className="text-sm text-muted-foreground">
              Connect an Instagram account first to receive messages here.
            </p>
          </div>
        </div>
      )}

      {/* Conversation list */}
      {!isLoading && filtered.length === 0 && firstActiveAccount && !isError && <EmptyState />}

      {!isLoading && filtered.length > 0 && firstActiveAccount && (
        <div className="flex flex-col gap-3">
          {filtered.map((conv) => {
            return (
              <ConversationRow
                key={conv.instagramId}
                conversation={conv}
                account={firstActiveAccount}
                onClick={() => setSelected({ conversation: conv, account: firstActiveAccount })}
              />
            );
          })}
        </div>
      )}

      {/* Send Message Sheet */}
      {selected && (
        <SendMessageDialog
          account={selected.account}
          open
          onOpenChange={(v) => {
            if (!v) setSelected(null);
          }}
          prefillTo={selected.conversation.instagramId}
        />
      )}
    </div>
  );
}
