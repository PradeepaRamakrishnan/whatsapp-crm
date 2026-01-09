'use client';

import { CheckCircle2, Clock, Mail, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponseConversationView } from '@/features/campaigns/components/response-conversation-view';
import type { BorrowerData } from '../lib/data';

interface ContactDetailsPageProps {
  contact: BorrowerData;
}

export function ContactDetailsPage({ contact }: ContactDetailsPageProps) {
  // const [searchQuery, setSearchQuery] = useState('');
  const [activeTab] = useState<'details' | 'responses'>('details');

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4 min-w-0">
      {/* Header and Toggle */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{contact.name}</h1>
            <p className="text-sm text-muted-foreground">{contact.loanType}</p>
          </div>
        </div>

        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'details' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('details')}
            className="rounded-md px-4"
          >
            Profile Info
          </Button>
          <Button
            variant={activeTab === 'responses' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('responses')}
            className="rounded-md px-4"
          >
            Response Queue
            <Badge className="ml-2 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
              2
            </Badge>
          </Button>
        </div>
      </div> */}

      {activeTab === 'details' ? (
        <div className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Primary contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-6">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Email Address</dt>
                    <dd className="text-sm font-medium mt-2">{contact.email}</dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Phone Number</dt>
                    <dd className="text-sm font-medium mt-2">{contact.phone}</dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-3">
                      Campaign Communications
                    </dt>
                    <dd className="space-y-3">
                      {/* Email Status */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <div className="rounded-full bg-emerald-100 dark:bg-emerald-950 p-1.5 mt-0.5">
                          <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">Email</p>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 border text-xs">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                              Sent
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                        </div>
                      </div>

                      {/* SMS Status */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-1.5 mt-0.5">
                          <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">SMS</p>
                            <Badge
                              variant="outline"
                              className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 text-xs"
                            >
                              <Clock className="h-2.5 w-2.5 mr-1" />
                              Waiting to send
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Scheduled for tomorrow
                          </p>
                        </div>
                      </div>

                      {/* WhatsApp Status */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <div className="rounded-full bg-green-100 dark:bg-green-950 p-1.5 mt-0.5">
                          <MessageSquare className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">WhatsApp</p>
                            <Badge
                              variant="outline"
                              className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 text-xs"
                            >
                              <Clock className="h-2.5 w-2.5 mr-1" />
                              Waiting to send
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Scheduled for 2 days</p>
                        </div>
                      </div>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Loan Details */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Loan Information
                </CardTitle>
                <CardDescription>Loan and payment details</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Loan Type</dt>
                      <dd className="text-sm font-medium mt-2">{contact.loanType}</dd>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Application Date</dt>
                      <dd className="text-sm font-medium mt-2">
                        {new Date(contact.applicationDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Financial Year</dt>
                      <dd className="text-sm font-medium mt-2">{contact.fy}</dd>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Month of Settlement</dt>
                      <dd className="text-sm font-medium mt-2">{contact.monthOfSettlement}</dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card> */}

            {/* Response Queue Mini-Card */}
            {/* <Card className="lg:col-span-2 shadow-lg border-2 border-primary/10">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>Recent Responses</CardTitle>
                  </div>
                  <Button variant="link" size="sm" onClick={() => setActiveTab('responses')} className="text-primary font-bold">
                    View Full Conversation Queue <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setActiveTab('responses')}>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm">John Doe</h4>
                        <span className="text-[10px] text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 italic">"I am interested in settling my loan. Please call me."</p>
                    </div>
                    <Badge variant="destructive">Urgent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      ) : (
        /* The Premium Response Conversation View */
        <div className="animate-in fade-in zoom-in duration-300">
          <ResponseConversationView contact={contact} />
        </div>
      )}
    </div>
  );
}
