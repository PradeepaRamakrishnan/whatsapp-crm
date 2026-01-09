'use client';

import {
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  User,
  Volume2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { BorrowerData } from '../lib/borrower-data';

interface ContactDetailsPageProps {
  contact: BorrowerData;
}

export function ContactDetailsPage({ contact }: ContactDetailsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{contact.name}</h1>
          <p className="text-sm text-muted-foreground">{contact.loanType}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settlement Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ₹{contact.loanAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">Primary loan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Installments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contact.installments}</div>
            <p className="text-xs text-muted-foreground">Total EMI count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settlement Count</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contact.settlementCount}</div>
            <p className="text-xs text-muted-foreground">Previous settlements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DND Status</CardTitle>
            <Phone className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                contact.dndStatus ? 'text-red-600' : 'text-emerald-600',
              )}
            >
              {contact.dndStatus ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">Do Not Disturb</p>
          </CardContent>
        </Card>
      </div>

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
                      <p className="text-xs text-muted-foreground mt-1">Scheduled for tomorrow</p>
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
        <Card>
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
        </Card>

        {/* Card & Banking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Card & Banking Details
            </CardTitle>
            <CardDescription>Bank account and card information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-6">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Primary Card Number</dt>
                <dd className="text-sm font-medium mt-2 font-mono text-muted-foreground">
                  ****{contact.primaryCardNumber.slice(-4)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-muted-foreground">Branch</dt>
                <dd className="text-sm font-medium mt-2">{contact.branch}</dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-muted-foreground">Linked Loan</dt>
                <dd className="text-sm font-medium mt-2">{contact.linkedLoan}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Location & Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Profile
            </CardTitle>
            <CardDescription>Geographic and professional information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-6">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">State</dt>
                <dd className="text-sm font-medium mt-2">{contact.state}</dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-muted-foreground">Profession</dt>
                <dd className="text-sm font-medium mt-2">{contact.profession}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Financial Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Financial Metrics
            </CardTitle>
            <CardDescription>Account balance and transaction details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">POS Amount</p>
                <p className="text-2xl font-bold mt-2">
                  ₹
                  {contact.posW.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold mt-2">
                  ₹
                  {contact.totalW.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Queue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Response Queue</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Badge variant="secondary">2</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search responses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="new" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="new" className="relative">
                    New
                    <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5">
                      2
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="space-y-3 mt-4">
                  {/* Response Item 1 */}
                  <div className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">John Doe</h4>
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      </div>
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">+91 9876543210</p>
                    <p className="text-sm line-clamp-2 mb-2">
                      I am interested in settling my loan. Please call m...
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>

                  {/* Response Item 2 */}
                  <div className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Jane Smith</h4>
                        <Badge variant="outline" className="text-xs">
                          Normal
                        </Badge>
                      </div>
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">+91 9876543211</p>
                    <p className="text-sm line-clamp-2 mb-2">Can we discuss payment options?</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </TabsContent>

                <TabsContent value="in-progress" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No responses in progress</p>
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No completed responses</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
