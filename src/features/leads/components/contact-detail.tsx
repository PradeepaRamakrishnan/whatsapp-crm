'use client';

import { CheckCircle2, CreditCard, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
                  <dt className="text-xs font-medium text-muted-foreground mb-3">
                    Campaign Communications
                  </dt>
                  <dd className="space-y-3">
                    {/* Status Badge */}
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="rounded-full bg-emerald-100 dark:bg-emerald-950 p-1.5 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Lead Status</p>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 border text-xs capitalize">
                            {contact.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-emerald-600 capitalize">
                          Interested since{' '}
                          {new Date(contact.interestedAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
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

                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Campaign Status</dt>
                  <dd className="text-sm font-medium mt-2 capitalize">
                    {contact.campaign?.status || '-'}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Settlement Amount</dt>
                  <dd className="text-sm font-medium mt-2">
                    ₹{contact.fileContent?.settlementAmount?.toLocaleString('en-IN') || 0}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Created At</dt>
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
