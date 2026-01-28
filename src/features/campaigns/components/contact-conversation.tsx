'use client';

import { CheckCircle2, Clock, Mail, MessageSquare, Phone } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Lead } from '@/features/leads/types';

interface ContactConversationProps {
  contact: Lead;
}

type Channel = 'email' | 'sms' | 'whatsapp';

// biome-ignore lint/correctness/noUnusedFunctionParameters: Required for component API
export function ContactConversation({ contact }: ContactConversationProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('email');
  const [emailMessage, setEmailMessage] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // const settlementAmount = contact.fileContent?.settlementAmount || 0;

  return (
    <div className="space-y-4">
      {/* Channel Selector Buttons */}
      <div className="flex gap-3">
        <Button
          variant={selectedChannel === 'email' ? 'default' : 'outline'}
          className={`flex items-center gap-2 ${
            selectedChannel === 'email'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'hover:bg-emerald-50 dark:hover:bg-emerald-950'
          }`}
          onClick={() => setSelectedChannel('email')}
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>
        <Button
          variant={selectedChannel === 'sms' ? 'default' : 'outline'}
          className={`flex items-center gap-2 ${
            selectedChannel === 'sms'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'hover:bg-blue-50 dark:hover:bg-blue-950'
          }`}
          onClick={() => setSelectedChannel('sms')}
        >
          <MessageSquare className="h-4 w-4" />
          SMS
        </Button>
        <Button
          variant={selectedChannel === 'whatsapp' ? 'default' : 'outline'}
          className={`flex items-center gap-2 ${
            selectedChannel === 'whatsapp'
              ? 'bg-green-600 hover:bg-green-700'
              : 'hover:bg-green-50 dark:hover:bg-green-950'
          }`}
          onClick={() => setSelectedChannel('whatsapp')}
        >
          <Phone className="h-4 w-4" />
          WhatsApp
        </Button>
      </div>

      {/* Email Channel */}
      {selectedChannel === 'email' && (
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-950 p-2">
                  <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-base">Email</CardTitle>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 border text-xs">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Email Thread */}
            <div className="flex-1 space-y-3 overflow-y-auto mb-4" style={{ maxHeight: '400px' }}>
              {/* Sent Message */}
              <div className="flex flex-col items-end">
                <div className="bg-emerald-100 dark:bg-emerald-950 rounded-lg p-3 max-w-[85%]">
                  <p className="text-xs font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                    Settlement Offer
                  </p>
                  {/* <p className="text-xs text-emerald-800 dark:text-emerald-200">
                    Dear {contact.customerName}, we have a special settlement offer for you...
                  </p> */}
                </div>
                <span className="text-xs text-muted-foreground mt-1">2 hours ago</span>
              </div>

              {/* Received Message */}
              <div className="flex flex-col items-start">
                <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                  <p className="text-xs font-medium mb-1">Re: Settlement Offer</p>
                  <p className="text-xs text-muted-foreground">
                    I am interested. Please call me to discuss.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">1 hour ago</span>
              </div>
            </div>

            {/* Email Input */}
            <div className="pt-3 border-t mt-auto">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  className="h-9 text-sm"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                />
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
                  <Mail className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMS Channel */}
      {selectedChannel === 'sms' && (
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-base">SMS</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 text-xs"
              >
                Scheduled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* SMS Thread */}
            <div className="flex-1 space-y-3 overflow-y-auto mb-4" style={{ maxHeight: '400px' }}>
              {/* Sent SMS */}
              <div className="flex flex-col items-end">
                <div className="bg-blue-100 dark:bg-blue-950 rounded-lg p-3 max-w-[85%]">
                  {/* <p className="text-xs text-blue-800 dark:text-blue-200">
                    Hi! Your loan settlement amount is ₹{settlementAmount.toLocaleString('en-IN')}.
                    Reply YES to proceed.
                  </p> */}
                </div>
                <span className="text-xs text-muted-foreground mt-1">Yesterday</span>
              </div>

              {/* Received SMS */}
              <div className="flex flex-col items-start">
                <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                  <p className="text-xs text-muted-foreground">YES</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Yesterday</span>
              </div>

              {/* Scheduled SMS */}
              <div className="flex flex-col items-end">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 max-w-[85%] border border-dashed border-blue-300 dark:border-blue-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <p className="text-xs font-medium text-amber-600">Scheduled</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Thank you! We will contact you within 24 hours.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Sending tomorrow</span>
              </div>
            </div>

            {/* SMS Input */}
            <div className="pt-3 border-t mt-auto">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type SMS message..."
                  className="h-9 text-sm"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  maxLength={160}
                />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shrink-0">
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {160 - smsMessage.length} characters remaining
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Channel */}
      {selectedChannel === 'whatsapp' && (
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-green-100 dark:bg-green-950 p-2">
                  <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-base">WhatsApp</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 text-xs"
              >
                Scheduled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* WhatsApp Thread */}
            <div className="flex-1 space-y-3 overflow-y-auto mb-4" style={{ maxHeight: '400px' }}>
              {/* Sent WhatsApp */}
              <div className="flex flex-col items-end">
                <div className="bg-green-100 dark:bg-green-950 rounded-lg p-3 max-w-[85%]">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    Hello! 👋 We have a special settlement plan designed for you.
                  </p>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <span className="text-[10px] text-green-700 dark:text-green-300">10:30 AM</span>
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-1">3 days ago</span>
              </div>

              {/* Scheduled WhatsApp */}
              <div className="flex flex-col items-end">
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 max-w-[85%] border border-dashed border-green-300 dark:border-green-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <p className="text-xs font-medium text-amber-600">Scheduled</p>
                  </div>
                  {/* <p className="text-xs text-muted-foreground">
                    Your settlement amount is ₹{settlementAmount.toLocaleString('en-IN')}. Would you
                    like to proceed?
                  </p> */}
                </div>
                <span className="text-xs text-muted-foreground mt-1">Sending in 2 days</span>
              </div>
            </div>

            {/* WhatsApp Input */}
            <div className="pt-3 border-t mt-auto">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type WhatsApp message..."
                  className="h-9 text-sm"
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                />
                <Button size="sm" className="bg-green-600 hover:bg-green-700 shrink-0">
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
