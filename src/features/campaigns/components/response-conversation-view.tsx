'use client';

import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Mail,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Volume2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { BorrowerData } from '../lib/borrower-data';

interface Message {
  id: string;
  sender: 'contact' | 'agent';
  content: string;
  timestamp: string;
  type: 'whatsapp' | 'email' | 'sms';
  status?: 'sent' | 'delivered' | 'read';
  subject?: string;
}

interface ConversationResponse {
  id: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  lastMessage: string;
  time: string;
  priority: 'urgent' | 'normal';
  status: 'new' | 'in-progress' | 'completed';
  type: 'whatsapp' | 'email' | 'sms';
  unreadCount?: number;
  messages: Message[];
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'contact',
    content: 'I am interested in settling my loan. Please call me.',
    timestamp: '10:30 AM',
    type: 'whatsapp',
  },
  {
    id: '2',
    sender: 'agent',
    content:
      'Hello! Thank you for your interest. We can discuss the settlement options. When would be a good time to call?',
    timestamp: '10:35 AM',
    type: 'whatsapp',
    status: 'read',
  },
  {
    id: '3',
    sender: 'contact',
    content: 'You can call me around 2 PM today.',
    timestamp: '10:40 AM',
    type: 'whatsapp',
  },
];

const MOCK_EMAIL_MESSAGES: Message[] = [
  {
    id: 'e1',
    sender: 'contact',
    subject: 'Loan Settlement Inquiry',
    content: `Dear Team,

I am writing to inquire about the possibility of settling my outstanding loan balance. 
I have been facing some financial difficulties and would like to know if there are any settlement programs available.

Best regards,
John Doe`,
    timestamp: '9:00 AM',
    type: 'email',
  },
  {
    id: 'e2',
    sender: 'agent',
    subject: 'Re: Loan Settlement Inquiry',
    content: `Dear Mr. Doe,

Thank you for reaching out. We have received your request regarding loan settlement. 
An agent has been assigned to your case and will review your file shortly.

We will contact you via your preferred communication channel once we have an update.

Regards,
Samatva CRM Team`,
    timestamp: '9:45 AM',
    type: 'email',
  },
];

export function ResponseConversationView({ contact }: { contact: BorrowerData }) {
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');

  const responses: ConversationResponse[] = [
    {
      id: '1',
      contactName: contact.name,
      contactPhone: contact.phone,
      contactEmail: contact.email,
      lastMessage: 'I am interested in settling my loan. Please call me.',
      time: '2h ago',
      priority: 'urgent',
      status: 'new',
      type: 'whatsapp',
      unreadCount: 2,
      messages: MOCK_MESSAGES,
    },
    {
      id: '2',
      contactName: 'Jane Smith',
      contactPhone: '+91 9876543211',
      contactEmail: 'jane@example.com',
      lastMessage: 'Can we discuss payment options?',
      time: '3h ago',
      priority: 'normal',
      status: 'new',
      type: 'email',
      messages: MOCK_EMAIL_MESSAGES,
    },
  ];

  const selectedResponse = responses.find((r) => r.id === selectedResponseId) || responses[0];

  return (
    <div className="flex h-[800px] w-full bg-background border rounded-xl overflow-hidden shadow-2xl">
      {/* Response Queue Sidebar */}
      <div className="w-[350px] border-r flex flex-col bg-muted/20">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-lg">Response Queue</h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-none ring-1 ring-border focus-visible:ring-primary shadow-sm"
            />
          </div>
        </div>

        <Tabs defaultValue="new" className="flex-1 flex flex-col">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-3 h-9 bg-muted/50 p-1">
              <TabsTrigger
                value="new"
                className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                New{' '}
                <Badge
                  variant="destructive"
                  className="ml-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  2
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Progress
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Done
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="new" className="flex-1 overflow-y-auto mt-0">
            <div className="divide-y divide-border/50">
              {responses.map((resp) => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <>
                // biome-ignore lint/a11y/noStaticElementInteractions: <>
                <div
                  key={resp.id}
                  onClick={() => setSelectedResponseId(resp.id)}
                  className={cn(
                    'p-4 cursor-pointer transition-all hover:bg-muted/50 relative',
                    selectedResponseId === resp.id && 'bg-primary/5 border-l-4 border-primary',
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate max-w-[120px]">
                        {resp.contactName}
                      </span>
                      {resp.priority === 'urgent' && (
                        <Badge
                          variant="destructive"
                          className="h-4 text-[9px] uppercase tracking-wider px-1"
                        >
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {resp.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {resp.type === 'whatsapp' ? (
                      <MessageSquare className="h-3 w-3 text-emerald-500" />
                    ) : resp.type === 'email' ? (
                      <Mail className="h-3 w-3 text-blue-500" />
                    ) : (
                      <MessageSquare className="h-3 w-3 text-orange-500" />
                    )}
                    <span className="text-xs text-muted-foreground">{resp.contactPhone}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed ">
                    {resp.lastMessage}
                  </p>
                  {resp.unreadCount && resp.unreadCount > 0 && selectedResponseId !== resp.id && (
                    <div className="absolute right-4 bottom-4 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold">
                      {resp.unreadCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent
            value="in-progress"
            className="flex-1 flex items-center justify-center p-8 text-muted-foreground"
          >
            <div className="text-center">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No active items</p>
            </div>
          </TabsContent>
          <TabsContent
            value="completed"
            className="flex-1 flex items-center justify-center p-8 text-muted-foreground"
          >
            <div className="text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-xs">Nothing completed yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        {/* Customer Information Bar (Premium Design) */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-background to-muted/30">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/5 text-primary">
                {selectedResponse.contactName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{selectedResponse.contactName}</h3>
                <Badge variant="outline" className="text-[10px] font-normal py-0">
                  ICICI Bank
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {selectedResponse.contactPhone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {selectedResponse.contactEmail}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 pr-4">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Outstanding
              </p>
              <p className="text-sm font-bold text-destructive">₹25,000</p>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Last Contact
              </p>
              <p className="text-sm font-medium">2 hours ago</p>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full shadow-sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversation View */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedResponse.type === 'whatsapp' ? (
            /* WhatsApp Style Thread */
            <div className="flex-1 bg-[#efe7de] dark:bg-zinc-900/50 p-6 flex flex-col gap-4 overflow-y-auto relative">
              {/* WhatsApp Background Pattern (Simulated with CSS) */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

              <div className="flex justify-center mb-4">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] px-3 py-1 rounded-full font-medium uppercase tracking-widest shadow-sm border border-blue-200/50 dark:border-blue-800/50">
                  Today
                </span>
              </div>

              {selectedResponse.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'max-w-[70%] relative group',
                    msg.sender === 'agent' ? 'self-end' : 'self-start',
                  )}
                >
                  <div
                    className={cn(
                      'p-3 rounded-2xl shadow-sm relative',
                      msg.sender === 'agent'
                        ? 'bg-[#dcf8c6] dark:bg-emerald-900/80 text-foreground rounded-tr-none'
                        : 'bg-white dark:bg-zinc-800 text-foreground rounded-tl-none border border-black/5',
                    )}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] opacity-50">{msg.timestamp}</span>
                      {msg.sender === 'agent' && (
                        <div className="flex">
                          <CheckCircle2
                            className={cn(
                              'h-3 w-3',
                              msg.status === 'read' ? 'text-blue-500' : 'text-muted-foreground',
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Email Style Thread */
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-8 flex flex-col gap-6 overflow-y-auto">
              {selectedResponse.messages.map((msg) => (
                <Card
                  key={msg.id}
                  className="shadow-md border-zinc-200 dark:border-zinc-800 overflow-hidden"
                >
                  <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={
                            msg.sender === 'agent'
                              ? 'bg-blue-500 text-white'
                              : 'bg-zinc-200 text-zinc-700'
                          }
                        >
                          {msg.sender === 'agent' ? 'A' : 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">
                          {msg.sender === 'agent'
                            ? 'Samatva Support'
                            : selectedResponse.contactName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {msg.sender === 'agent'
                            ? 'support@samatva.com'
                            : selectedResponse.contactEmail}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">{msg.timestamp}</p>
                      <Badge variant="outline" className="text-[9px] h-4">
                        Email
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-8">
                    {msg.subject && (
                      <h4 className="font-bold text-base mb-6 text-primary">
                        Subject: {msg.subject}
                      </h4>
                    )}
                    <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed  border-l-2 border-primary/20 pl-4 py-1">
                      {msg.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Input & Actions Panel */}
        <div className="p-4 border-t bg-muted/20 space-y-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 rounded-full text-xs font-medium dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Interested
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 rounded-full text-xs font-medium dark:bg-red-950/30 dark:text-red-400 dark:border-red-900"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Not Interested
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 rounded-full text-xs font-medium dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Follow-up
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              <Info className="h-3 w-3" />
              Response Details: Received via {selectedResponse.type}
            </div>
          </div>

          {/* Schedule Call / Input Section */}
          <div className="grid grid-cols-3 gap-4 border p-4 rounded-xl bg-background shadow-inner">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Schedule Call & Notes
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input type="date" className="h-9 text-xs" />
                <Input type="time" className="h-9 text-xs" />
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option>Assign to team member</option>
                  <option>Admin</option>
                  <option>Sales Manager</option>
                </select>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Add interaction notes or reply message..."
                  className="min-h-[80px] text-sm resize-none pr-12 focus-visible:ring-primary/20"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="absolute right-2 bottom-2 flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-sm hover:bg-primary/10 hover:text-primary"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-sm hover:bg-primary/10 hover:text-primary"
                  >
                    <Smile className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between py-1">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Action Status
                  </span>
                </div>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option>Update status...</option>
                  <option>Call Scheduled</option>
                  <option>In Discussion</option>
                  <option>Awaiting Payment</option>
                </select>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-sm h-10 shadow-lg shadow-primary/20 group">
                  <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Send & Schedule
                </Button>
                <Button variant="outline" className="w-full text-xs h-9">
                  Complete Response
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
