import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowRightCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  StickyNote,
  Upload,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CampaignConversation } from '@/components/shared/campaign-conversation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { addTimelineEntry, updateLead } from '../services';
import type { Lead, TimelineEntry } from '../types';
import { ContactDetailsPage } from './contact-detail';
import { LeadDocuments } from './lead-documents';
import { LeadNotes } from './lead-notes';

interface LeadDetailSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailSheet({ lead, isOpen, onOpenChange }: LeadDetailSheetProps) {
  const queryClient = useQueryClient();

  const [showMoveConfirm, setShowMoveConfirm] = useState(false);
  const [movedToNbfc, setMovedToNbfc] = useState(false);

  const { mutate: moveToNbfc, isPending: isMoving } = useMutation({
    mutationFn: () => {
      if (!lead) throw new Error('Lead not found');
      return updateLead(lead.id, { movetoNbfc: true });
    },
    onSuccess: () => {
      toast.success('Lead moved to NBFC successfully');
      setShowMoveConfirm(false);
      setMovedToNbfc(true);
      // Add timeline entry
      if (lead) {
        addTimelineEntry(
          lead.id,
          {
            type: 'moved_to_nbfc',
            title: 'Moved to NBFC',
            description: 'Lead was moved to NBFC for further processing.',
          },
          lead.timeline,
        ).catch(() => {});
      }
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (lead) {
        queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move lead to NBFC');
    },
  });

  if (!lead) return null;

  // Helper: icon per timeline entry type
  const getTimelineIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'note_added':
        return <StickyNote className="h-4 w-4 text-amber-600" />;
      case 'document_uploaded':
        return <Upload className="h-4 w-4 text-violet-600" />;
      case 'moved_to_nbfc':
        return <ArrowRightCircle className="h-4 w-4 text-blue-600" />;
      case 'status_changed':
        return <Activity className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTimelineIconBg = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'note_added':
        return 'bg-amber-50 dark:bg-amber-900/30';
      case 'document_uploaded':
        return 'bg-violet-50 dark:bg-violet-900/30';
      case 'moved_to_nbfc':
        return 'bg-blue-50 dark:bg-blue-900/30';
      case 'status_changed':
        return 'bg-orange-50 dark:bg-orange-900/30';
      default:
        return 'bg-slate-50 dark:bg-slate-900/30';
    }
  };

  const allTimelineEvents = (lead.timeline || [])
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description || '',
      date: entry.timestamp,
      icon: getTimelineIcon(entry.type),
      iconBg: getTimelineIconBg(entry.type),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

          <div className="absolute right-12 top-4">
            {movedToNbfc || lead.movetoNbfc === true ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Moved to NBFC
              </Badge>
            ) : (
              <Button size="sm" onClick={() => setShowMoveConfirm(true)}>
                Move to NBFC
              </Button>
            )}
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
              timeline={lead.timeline}
              email={lead.fileContent?.emailId}
            />
          </TabsContent>

          <TabsContent value="timeline" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
            <div className="relative space-y-3 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {allTimelineEvents.length > 0 ? (
                allTimelineEvents.map((event, idx) => (
                  <div
                    key={event.id}
                    className="group relative flex items-start gap-3 transition-all duration-300"
                  >
                    {/* Icon Container */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background ring-4 ring-background shadow-sm border border-border z-10 transition-transform duration-300 group-hover:scale-110">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300',
                          event.iconBg,
                        )}
                      >
                        {event.icon}
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-card border border-border/60 p-2 rounded-lg group-hover:border-primary/20 group-hover:shadow-md">
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
                          {new Date(event.date).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}
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
            {lead.id && (
              <LeadNotes leadId={lead.id} initialNotes={lead.notes} timeline={lead.timeline} />
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>

      <AlertDialog open={showMoveConfirm} onOpenChange={setShowMoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to NBFC</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this lead to NBFC? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                moveToNbfc();
              }}
              disabled={isMoving}
            >
              {isMoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Move to NBFC
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
