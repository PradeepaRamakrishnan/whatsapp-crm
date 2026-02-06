/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
'use client';

import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CampaignConversation } from '@/components/shared/campaign-conversation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCompaignById } from '../services';
import type { Lead, LeadsResponse } from '../types';
import { ContactDetailsPage } from './contact-detail';
import { LeadDocuments } from './lead-documents';

interface LeadDetailsPageProps {
  leadId: string;
}

export function LeadDetailsPage({ leadId }: LeadDetailsPageProps) {
  const { data: leadResponse, isLoading } = useQuery({
    queryKey: ['campaign', leadId],
    queryFn: () => getCompaignById(leadId),
  });

  // Support both paginated shape (LeadsResponse) and plain array response
  const leads: Lead[] = ((leadResponse as LeadsResponse)?.data as Lead[] | undefined) || [];

  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getLeadStatusBadgeClass = (status: string | undefined) => {
    if (!status)
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300';
    const normalized = status.toLowerCase();
    if (normalized === 'interested' || normalized === 'active') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    }
    if (normalized === 'converted' || normalized === 'won') {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    }
    if (normalized === 'rejected' || normalized === 'lost' || normalized === 'closed') {
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300';
  };

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads;
    const term = search.toLowerCase();
    return leads.filter((lead) => {
      const nameMatch = lead.customerName?.toLowerCase().includes(term);
      const campaignMatch = lead.campaign?.name?.toLowerCase().includes(term);
      const statusMatch = lead.status?.toLowerCase().includes(term);
      return nameMatch || campaignMatch || statusMatch;
    });
  }, [leads, search]);

  const pageCount = Math.ceil(filteredLeads.length / pageSize) || 1;

  const paginatedLeads = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredLeads.slice(start, end);
  }, [filteredLeads, pageIndex, pageSize]);

  // console.log('Leads data:', leads);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
        Lead not found.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {(() => {
        const campaign = leads[0]?.campaign;
        if (!campaign) return null;

        const createdDate = campaign.createdAt
          ? new Date(campaign.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '-';

        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
                  <Badge variant="secondary" className="border capitalize">
                    {campaign.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span>Created {createdDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>ID: {campaign.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      <div>
        <h2 className="text-lg font-semibold">Leads List</h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
          <div className="flex flex-1 items-center gap-2">
            <Input
              className="h-8 w-full sm:w-60"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              placeholder="Search leads..."
              type="text"
              aria-label="Search leads"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Label className="text-sm text-muted-foreground">Rows per page</Label>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                const size = Number(val) || 10;
                setPageSize(size);
                setPageIndex(0);
              }}
            >
              <SelectTrigger size="sm" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interested At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  setSelectedLead(lead);
                  setIsSheetOpen(true);
                }}
              >
                <TableCell className="font-medium">{lead.customerName}</TableCell>
                <TableCell>{lead.fileContent?.emailId || '-'}</TableCell>
                <TableCell>{lead.fileContent?.mobileNumber || '-'}</TableCell>
                <TableCell>{lead.campaign?.name || '-'}</TableCell>
                <TableCell>
                  ₹{lead.fileContent?.settlementAmount?.toLocaleString('en-IN') || 0}
                </TableCell>
                <TableCell>
                  {lead.status ? (
                    <Badge
                      variant="outline"
                      className={`capitalize text-xs font-medium px-2 py-1 border ${getLeadStatusBadgeClass(lead.status)}`}
                    >
                      {lead.status}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {lead.interestedAt
                    ? new Date(lead.interestedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      // future: open actions menu
                    }}
                  >
                    ...
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-end space-x-2 p-4">
          <div className="text-muted-foreground flex-1 text-sm">
            Showing {filteredLeads.length ? pageIndex * pageSize + 1 : 0} to{' '}
            {Math.min((pageIndex + 1) * pageSize, filteredLeads.length)} of {filteredLeads.length}{' '}
            results
          </div>
          <div className="space-x-2 flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => (prev + 1 < pageCount ? prev + 1 : prev))}
              disabled={pageIndex + 1 >= pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) setSelectedLead(null);
        }}
      >
        <SheetContent className="flex flex-col sm:max-w-4xl">
          <SheetHeader className="border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm border border-primary/20">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl font-bold tracking-tight">
                  {selectedLead?.customerName || 'Lead Details'}
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                    <span className="truncate font-medium">
                      {selectedLead?.fileContent?.emailId || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-green-500" />
                    <span className="truncate font-medium">
                      {selectedLead?.fileContent?.mobileNumber || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SheetHeader>

          {selectedLead && (
            <Tabs defaultValue="details" className="flex flex-1 flex-col overflow-hidden mt-2">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                {/* <TabsTrigger value="documents">Documents</TabsTrigger> */}
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
                <ContactDetailsPage contact={selectedLead} />
              </TabsContent>

              <TabsContent value="documents" className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
                <LeadDocuments
                  leadId={selectedLead.id}
                  campaignId={selectedLead.campaign?.id}
                  contactId={selectedLead.contact?.id}
                  initialDocuments={selectedLead.documents}
                />
              </TabsContent>

              <TabsContent
                value="conversation"
                className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0"
              >
                {selectedLead.campaign?.id && selectedLead.contact?.id && (
                  <CampaignConversation
                    campaignId={selectedLead.campaign.id}
                    contactId={selectedLead.contact.id}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
