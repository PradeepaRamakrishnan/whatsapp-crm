/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <> */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  FileText,
  Instagram,
  Loader2,
  MessageSquare,
  Search,
  Send,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  getInstagramAccounts,
  getInstagramConversations,
  getInstagramMessagesByPeerId,
  getInstagramTemplates,
  sendInstagramMessage,
  syncInstagramMessages,
} from '../services';
import type {
  InstagramAccount,
  InstagramConversation,
  InstagramMessage,
  InstagramTemplate,
} from '../types';

/** Helper to extract plain text body from InstagramTemplate */
const getTemplateBodyText = (template: InstagramTemplate): string => {
  // 1. Try body (usually for custom/local)
  if (template.body) return template.body;
  // 2. Try description (sync logic uses this for BODY component)
  if (template.description) return template.description;
  // 3. Fallback: Parse components if available (Meta standard)
  if (template.components && Array.isArray(template.components)) {
    const bodyComp = template.components.find((c: any) => c.type === 'BODY' || c.type === 'body');
    if (bodyComp?.text) return bodyComp.text;
  }
  return '';
};

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoSynced = useRef(false);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<InstagramConversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

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
    refetchInterval: 10000,
  });

  const { data: messages = [], isLoading: isMessagesLoading } = useQuery<InstagramMessage[]>({
    queryKey: ['instagram-messages', activeAccount?.id, selected?.instagramId],
    queryFn: () => {
      if (!selected?.instagramId) {
        return Promise.resolve([]);
      }
      return getInstagramMessagesByPeerId(selected.instagramId, activeAccount?.id);
    },
    enabled: !!activeAccount && !!selected?.instagramId,
    retry: 1,
    refetchInterval: 3000,
  });

  const { data: approvedTemplates = [] } = useQuery<InstagramTemplate[]>({
    queryKey: ['instagram-templates', activeAccount?.id, 'APPROVED'],
    queryFn: () => getInstagramTemplates(activeAccount?.id ?? '', 'APPROVED'),
    enabled: !!activeAccount?.id,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, selected?.instagramId]);

  const sendMessage = useMutation({
    mutationFn: ({
      to,
      text,
      templateId,
    }: {
      to: string;
      text: string;
      templateId?: string | null;
    }) => {
      if (!activeAccount) throw new Error('No active account');
      return sendInstagramMessage(activeAccount.id, to, text, templateId);
    },
    onMutate: async ({ text }) => {
      const queryKey = ['instagram-messages', activeAccount?.id, selected?.instagramId];
      await queryClient.cancelQueries({ queryKey });

      const prevMessages = queryClient.getQueryData<InstagramMessage[]>(queryKey);

      const optimisticMsg: InstagramMessage = {
        id: `temp-${Date.now()}`,
        text,
        direction: 'outbound',
        createdAt: new Date().toISOString(),
        status: 'sending' as any,
      } as any;

      queryClient.setQueryData<InstagramMessage[]>(queryKey, (old = []) => [...old, optimisticMsg]);

      return { prevMessages };
    },
    onSuccess: (newMsg) => {
      const queryKey = ['instagram-messages', activeAccount?.id, selected?.instagramId];
      queryClient.setQueryData<InstagramMessage[]>(queryKey, (old = []) => {
        // Replace the optimistic message with the real one
        return old.map((m) => (m.id.startsWith('temp-') && m.text === newMsg.text ? newMsg : m));
      });
    },
    onError: (_err, _variables, context: any) => {
      const queryKey = ['instagram-messages', activeAccount?.id, selected?.instagramId];
      queryClient.setQueryData(queryKey, context?.prevMessages);
      toast.error('Failed to send message');
    },
    onSettled: () => {
      setIsSending(false);
      setSelectedTemplateId(null);
      queryClient.invalidateQueries({ queryKey: ['instagram-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['instagram-messages'] });
    },
  });

  const syncMessages = useMutation({
    mutationFn: () => {
      if (!activeAccount) throw new Error('No active account');
      return syncInstagramMessages(activeAccount.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['instagram-messages'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to sync messages');
    },
  });

  useEffect(() => {
    if (activeAccount?.id && !hasAutoSynced.current) {
      hasAutoSynced.current = true;
      syncMessages.mutate();
    }
  }, [activeAccount?.id, syncMessages]);

  const handleSend = async () => {
    if (!selected || !messageText.trim() || isSending) return;
    const textToSend = messageText;
    const templateId = selectedTemplateId;
    setMessageText('');
    setIsSending(true);
    sendMessage.mutate({ to: selected.instagramId, text: textToSend, templateId });
  };

  const filtered = Array.isArray(conversations)
    ? conversations.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.username?.toLowerCase().includes(q) ||
          c.instagramId.toLowerCase().includes(q) ||
          c.lastMessage?.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-white border rounded-2xl shadow-sm">
      {/* Sidebar: Conversation List */}
      <div className="flex w-full max-w-[320px] flex-col border-r bg-zinc-50/30">
        <div className="p-4 border-b space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className=" text-lg flex items-center gap-2">
              <Instagram className="h-5 w-5 text-purple-600" />
              {activeAccount?.username || 'Account'}
            </h2>
            <div className="flex items-center gap-2"></div>
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
                  <h3 className="text-sm ">{selected.username || selected.instagramId}</h3>
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
                {isMessagesLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground italic text-xs">
                    No message history found for this user.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col max-w-[80%] gap-1',
                        msg.direction === 'outbound' ? 'ml-auto items-end' : 'items-start',
                      )}
                    >
                      <div
                        className={cn(
                          'group relative rounded-2xl px-4 py-2.5 text-sm shadow-sm flex flex-col gap-2',
                          msg.direction === 'outbound'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border text-foreground',
                        )}
                      >
                        {msg.type === 'video' && (msg.metadata?.videoUrl || msg.metadata?.url) && (
                          <div className="rounded-lg overflow-hidden border border-white/20 bg-black/5 aspect-square max-w-[240px] mb-1">
                            {/* biome-ignore lint/a11y/useMediaCaption: <Meta Video Content> */}
                            <video
                              src={msg.metadata.videoUrl || msg.metadata.url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {msg.type === 'file' && msg.metadata?.url && (
                          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm min-w-[200px] mb-1">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/20">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">
                                {msg.metadata.filename || 'Document.pdf'}
                              </p>
                              <p className="text-[10px] opacity-70">Document</p>
                            </div>
                          </div>
                        )}

                        {msg.type === 'template' && msg.metadata ? (
                          <div
                            className={cn(
                              'flex flex-col gap-0 overflow-hidden rounded-xl border min-w-[240px] max-w-[300px] shadow-md',
                              msg.direction === 'outbound'
                                ? 'bg-white text-slate-900 border-slate-200'
                                : 'bg-white border-slate-200',
                            )}
                          >
                            {/* Header Section */}
                            {msg.metadata.headerType === 'DOCUMENT' ? (
                              <div className="p-4 bg-slate-50 border-b flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                  <FileText className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold truncate leading-tight">
                                    {msg.metadata.headerText || 'Document.pdf'}
                                  </p>
                                </div>
                              </div>
                            ) : msg.metadata.headerType === 'VIDEO' ? (
                              <div className="relative aspect-video bg-black flex items-center justify-center group/vid">
                                {msg.metadata.imageUrl ? (
                                  <>
                                    {/* biome-ignore lint/performance/noImgElement: <External Meta Media URL> */}
                                    <img
                                      src={msg.metadata.imageUrl}
                                      alt="Video Preview"
                                      className="w-full h-full object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 group-hover/vid:scale-110 transition-transform">
                                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-white text-[10px] flex flex-col items-center gap-1 opacity-60">
                                    <div className="h-8 w-8 rounded-full border border-white/40 flex items-center justify-center">
                                      <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                                    </div>
                                    Video Content
                                  </div>
                                )}
                              </div>
                            ) : msg.metadata.imageUrl ? (
                              <div className="relative aspect-video overflow-hidden">
                                {/* biome-ignore lint/performance/noImgElement: <External Meta Media URL> */}
                                <img
                                  src={msg.metadata.imageUrl}
                                  alt="Template"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : null}

                            {/* Body Section */}
                            <div className="p-4 flex flex-col gap-1.5">
                              <h4 className="font-bold text-sm leading-snug">
                                {msg.metadata.title}
                              </h4>
                              {msg.metadata.subtitle && (
                                <p className="text-[11px] text-slate-500 leading-relaxed italic border-t pt-1.5 mt-1">
                                  {msg.metadata.subtitle.startsWith('Powered by') ||
                                  msg.metadata.subtitle.startsWith('powered by')
                                    ? msg.metadata.subtitle
                                    : `Powered by ${msg.metadata.subtitle}`}
                                </p>
                              )}
                            </div>

                            {/* Buttons Section */}
                            {msg.metadata.buttons && msg.metadata.buttons.length > 0 && (
                              <div className="flex flex-col border-t divide-y">
                                {msg.metadata.buttons.map((btn: any, idx: number) => (
                                  <div
                                    key={`${btn.title || 'btn'}-${idx}`}
                                    className="px-4 py-2.5 text-center text-[13px] font-semibold text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                                  >
                                    {btn.type === 'web_url' && (
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                    )}
                                    {btn.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        {msg.status === 'sending' && ' • Sending...'}
                      </span>
                    </div>
                  ))
                )}
                <div ref={scrollRef} className="h-0 w-0" />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-end gap-3 max-w-4xl mx-auto border rounded-xl p-2 bg-zinc-50/50 shadow-inner focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:border-purple-200 transition-all">
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 shrink-0 text-muted-foreground hover:text-purple-600 hover:bg-purple-50"
                        title="Templates"
                      />
                    }
                  >
                    <FileText className="h-5 w-5" />
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-80 p-0 overflow-hidden shadow-xl border-purple-100"
                  >
                    <div className="p-3 border-b bg-zinc-50/50">
                      <h4 className="text-xs font-semibold flex items-center gap-2">
                        <Instagram className="h-3.5 w-3.5 text-purple-600" />
                        Approved Templates
                      </h4>
                    </div>
                    <ScrollArea className="max-h-[300px]">
                      {approvedTemplates.length === 0 ? (
                        <div className="p-8 text-center bg-white">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                          <p className="text-xs text-muted-foreground italic">
                            No approved templates found
                          </p>
                        </div>
                      ) : (
                        <div className="p-1 bg-white">
                          {approvedTemplates.map((template) => {
                            const templateBody = getTemplateBodyText(template);
                            return (
                              <button
                                key={template.id}
                                type="button"
                                onClick={() => {
                                  setMessageText(templateBody);
                                  setSelectedTemplateId(template.id);
                                }}
                                className="w-full text-left p-3 hover:bg-purple-50/50 rounded-lg transition-all group border border-transparent hover:border-purple-100 mb-0.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold group-hover:text-purple-700 truncate">
                                    {template.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] h-4 px-1 bg-white uppercase text-purple-500 border-purple-100"
                                  >
                                    {template.category}
                                  </Badge>
                                </div>
                                {template.headerText && (
                                  <p className="text-[10px] font-bold text-foreground/80 mt-1 truncate">
                                    {template.headerText}
                                  </p>
                                )}
                                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                                  {templateBody || 'No content'}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                <div className="flex-1 flex flex-col gap-1">
                  {selectedTemplateId && (
                    <div className="flex items-center px-1">
                      <Badge
                        variant="secondary"
                        className="bg-purple-50 text-purple-600 border-purple-100 text-[9px] h-5 px-1.5 flex items-center gap-1 leading-none"
                      >
                        <Instagram className="h-2.5 w-2.5" />
                        Template Active (Structure will be sent)
                        <button
                          type="button"
                          onClick={() => setSelectedTemplateId(null)}
                          className="ml-1 hover:text-purple-900 font-bold"
                        >
                          ×
                        </button>
                      </Badge>
                    </div>
                  )}
                  <Textarea
                    placeholder="Type a message..."
                    className="min-h-[44px] max-h-[120px] border-none bg-transparent resize-none p-3 text-sm focus-visible:ring-0 shadow-none"
                    rows={1}
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      if (!e.target.value.trim()) setSelectedTemplateId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shrink-0 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
                  onClick={handleSend}
                  disabled={!messageText.trim() || isSending}
                >
                  {isSending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
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
