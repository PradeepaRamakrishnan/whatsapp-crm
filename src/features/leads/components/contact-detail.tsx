'use client';

import dayjs from 'dayjs';
import { CheckCircle2, CreditCard, Mail, MessageSquare, Phone, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
// import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Lead } from '../types';

interface ContactDetailsPageProps {
  contact: Lead;
}

export function ContactDetailsPage({ contact }: ContactDetailsPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 pt-4 min-w-0">
      <div className="space-y-6">
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
                  <dd className="text-sm font-medium mt-2">
                    {contact.fileContent?.emailId || '-'}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Phone Number</dt>
                  <dd className="text-sm font-medium mt-2">
                    {contact.fileContent?.mobileNumber || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Settlement Amount</dt>
                  <dd className="text-sm font-medium mt-2">
                    ₹{contact.fileContent?.settlementAmount?.toLocaleString('en-IN') || 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground mb-3">
                    Campaign Communications
                  </dt>

                  <dd className="space-y-3">
                    {contact.from && (
                      <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Source Channel
                        </span>

                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize bg-blue-50 text-blue-700 border-blue-200 
                     dark:bg-blue-950 dark:text-blue-300"
                        >
                          {contact.from}
                        </Badge>
                      </div>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Campaign Details
              </CardTitle>
              <CardDescription>Information about the originating campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-6">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Campaign Name</dt>
                  <dd className="text-sm font-medium mt-2">{contact.campaign?.name || '-'}</dd>
                </div>

                {/* <div>
                  <dt className="text-xs font-medium text-muted-foreground">Campaign Status</dt>
                  <dd className="text-sm font-medium mt-2 capitalize">
                    {contact.campaign?.status || '-'}
                  </dd>
                </div> */}

                <Separator />

                <div>
                  <dt className="text-sm font-semibold mb-3">Communication Channels</dt>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">Email</span>
                          {contact.contact?.email?.sentAt && (
                            <span className="text-[10px] text-muted-foreground">
                              {dayjs(contact.contact.email.sentAt).format('MMM DD, YYYY hh:mm A')}
                            </span>
                          )}
                        </div>
                      </div>
                      {contact.contact?.email?.sent ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">SMS</span>
                          {contact.contact?.sms?.sentAt && (
                            <span className="text-[10px] text-muted-foreground">
                              {dayjs(contact.contact.sms.sentAt).format('MMM DD, YYYY hh:mm A')}
                            </span>
                          )}
                        </div>
                      </div>
                      {contact.contact?.sms?.sent ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">WhatsApp</span>
                          {contact.contact?.whatsapp?.sentAt && (
                            <span className="text-[10px] text-muted-foreground">
                              {dayjs(contact.contact.whatsapp.sentAt).format(
                                'MMM DD, YYYY hh:mm A',
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      {contact.contact?.whatsapp?.sent ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Campaign Date</dt>
                  <dd className="text-sm font-medium mt-2">
                    {new Date(contact.createdAt).toLocaleString('en-IN')}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
