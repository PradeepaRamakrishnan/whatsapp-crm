import { Activity, CheckCircle2, FileText, Mail, MessageCircle, Phone, User } from 'lucide-react';
import { CampaignConversation } from '@/components/shared/campaign-conversation';
// import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Lead } from '../types';
import { ContactDetailsPage } from './contact-detail';
import { LeadDocuments } from './lead-documents';
import { LeadNotes } from './lead-notes';

interface LeadDetailSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailSheet({ lead, isOpen, onOpenChange }: LeadDetailSheetProps) {
  if (!lead) return null;

  // Construct timeline events from lead data
  const timelineEvents = [
    {
      id: 'created',
      title: 'Lead Created',
      description: 'Lead was added to the campaign database',
      date: lead.createdAt,
      icon: <FileText className="h-4 w-4 text-blue-600" />,
      type: 'created',
    },
    {
      id: 'email-sent',
      title: 'Email Sent',
      description: 'Campaign email was sent to the lead',
      date: lead.email?.sentAt || lead.contact?.email?.sentAt,
      show: lead.email?.sent || lead.contact?.email?.sent,
      icon: <Mail className="h-4 w-4 text-indigo-600" />,
      type: 'sent',
    },
    {
      id: 'whatsapp-sent',
      title: 'WhatsApp Sent',
      description: 'Campaign WhatsApp message was sent to the lead',
      date: lead.whatsapp?.sentAt || lead.contact?.whatsapp?.sentAt,
      show: lead.whatsapp?.sent || lead.contact?.whatsapp?.sent,
      icon: <MessageCircle className="h-4 w-4 text-emerald-600" />,
      type: 'sent',
    },
    {
      id: 'interested',
      title: 'Interested',
      description: 'Lead expressed interest in the campaign',
      date: lead.interestedAt,
      show: !!lead.interestedAt,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      type: 'milestone',
    },
    {
      id: 'consent',
      title: 'Consent Provided',
      description: 'Lead provided consent for further processing',
      date: lead.consentGivenAt,
      show: !!lead.consentGivenAt,
      icon: <CheckCircle2 className="h-4 w-4 text-purple-600" />,
      type: 'milestone',
    },
  ]
    .filter((event) => event.show !== false && event.date)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-4xl">
        <SheetHeader className="border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm border border-primary/20">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold tracking-tight">
                {lead.customerName || 'Lead Details'}
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-blue-500" />
                  <span className="truncate font-medium">{lead.fileContent?.emailId || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-green-500" />
                  <span className="truncate font-medium">
                    {lead.fileContent?.mobileNumber || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex flex-1 flex-col overflow-hidden mt-2">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>

            <TabsTrigger value="documentation">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
            <ContactDetailsPage contact={lead} />
          </TabsContent>
          <TabsContent
            value="conversation"
            className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0"
          >
            {lead.campaign?.id && lead.contact?.id && (
              <CampaignConversation campaignId={lead.campaign.id} contactId={lead.contact.id} />
            )}
          </TabsContent>

          <TabsContent value="documentation" className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
            <LeadDocuments
              leadId={lead.id}
              campaignId={lead.campaign?.id}
              contactId={lead.contact?.id}
              initialDocuments={lead.documents}
              email={lead.fileContent?.emailId}
            />
          </TabsContent>

          <TabsContent value="timeline" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
            <div className="relative space-y-3 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {timelineEvents.length > 0 ? (
                timelineEvents.map((event, idx) => (
                  <div
                    key={event.id}
                    className="group relative flex items-start gap-3 transition-all duration-300"
                  >
                    {/* Icon Container */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background ring-4 ring-background shadow-sm border border-border z-10 transition-transform duration-300 group-hover:scale-110">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300',
                          event.type === 'created' &&
                            'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                          event.type === 'sent' &&
                            'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
                          event.type === 'milestone' &&
                            'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                        )}
                      >
                        {event.icon}
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-card border border-border/60 p-2 rounded-lg  group-hover:border-primary/20 group-hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm tracking-tight">{event.title}</p>
                          {idx === 0 && (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-tighter">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/40">
                          <Activity className="h-3 w-3" />
                          {new Date(event.date!).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-6 border border-dashed border-muted-foreground/20">
                    <Activity className="h-10 w-10 text-muted-foreground/20 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">No Activity Found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
                    We haven&apos;t recorded any activities for this lead yet.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
            {lead.id && <LeadNotes leadId={lead.id} initialNotes={lead.notes} />}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
