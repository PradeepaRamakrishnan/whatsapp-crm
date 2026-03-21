'use client';

import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Plus, StickyNote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { addTimelineEntry, updateLead } from '@/features/leads/services';
import type { TimelineEntry } from '@/features/leads/types';

interface LeadNotesProps {
  leadId: string;
  initialNotes?: string | null;
  timeline?: TimelineEntry[] | null;
  onNotesUpdated?: (newNotes: string) => void;
}

export function LeadNotes({ leadId, initialNotes, timeline }: LeadNotesProps) {
  const router = useRouter();
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [notes, setNotes] = useState<string | null>(initialNotes || null);

  useEffect(() => {
    setNotes(initialNotes || null);
  }, [initialNotes]);

  const { mutate: addNote, isPending: isAddingNote } = useMutation({
    mutationFn: async (note: string) => {
      const timestamp = dayjs().format('D MMM YYYY, h:mm A');
      const formattedNote = `[${timestamp}]\n${note}`;
      const updatedNotes = notes ? `${formattedNote}\n\n${notes}` : formattedNote;

      await updateLead(leadId, { notes: updatedNotes });
      // Add timeline entry
      addTimelineEntry(
        leadId,
        {
          type: 'note_added',
          title: 'Note Added',
          description: note.length > 80 ? `${note.slice(0, 80)}…` : note,
        },
        timeline,
      ).catch(() => {});
      return updatedNotes;
    },
    onSuccess: (updatedNotes) => {
      setNotes(updatedNotes);
      setIsAddNoteOpen(false);
      setNewNoteContent('');
      toast.success('Note added successfully');
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add note');
    },
  });

  // Helper to parse notes string into individual note objects
  const parsedNotes = notes?.trim()
    ? notes
        .split(/\n\n+/)
        .filter(Boolean)
        .map((note, idx) => {
          const match = note.match(/^\[(.*?)\]\n([\s\S]*)$/);
          return {
            id: `${match ? match[1] : 'unknown'}-${idx}`,
            timestamp: match ? match[1] : 'Unknown Date',
            content: match ? match[2] : note,
          };
        })
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground  flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-primary" />
            Lead Notes
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
            Historical logs & internal updates
          </p>
        </div>
        <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="gap-2 h-9 px-4 rounded-lg shadow-sm font-bold text-[11px]"
              />
            }
          >
            <Plus className="w-4 h-4" />
            Add Note
          </DialogTrigger>
          <DialogContent className="max-w-[450px] rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg tracking-tight">New Activity Note</DialogTitle>
              <DialogDescription className="text-sm">
                Records of conversations, follow-ups, or internal observations.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="What did you discuss with this lead?"
                className="min-h-[120px] resize-none focus-visible:ring-primary rounded-xl border-slate-200"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                className="w-full sm:w-auto"
                onClick={() => addNote(newNoteContent)}
                disabled={isAddingNote || !newNoteContent.trim()}
              >
                {isAddingNote ? 'Saving...' : 'Save Activity'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="pb-8 space-y-4">
          {parsedNotes.length > 0 ? (
            parsedNotes.map((note, index) => (
              <div
                key={note.id}
                className="group relative bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      {note.timestamp}
                    </span>
                  </div>
                </div>
                <div className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {note.content}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6">
                <StickyNote className="w-8 h-8 text-slate-200 dark:text-slate-800" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                No Notes Found
              </h4>
              <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed">
                There are currently no notes or activities recorded for this lead.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
