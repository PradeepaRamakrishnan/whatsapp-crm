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
import { updateLead } from '@/features/leads/services';

interface LeadNotesProps {
  leadId: string;
  initialNotes?: string | null;
  onNotesUpdated?: (newNotes: string) => void;
}

export function LeadNotes({ leadId, initialNotes }: LeadNotesProps) {
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Notes
        </h3>
        <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 h-8">
              <Plus className="w-3.5 h-3.5" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>
                Add a private note to this lead. Only team members can see this.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Type your note here..."
                className="min-h-[100px]"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() => addNote(newNoteContent)}
                disabled={isAddingNote || !newNoteContent.trim()}
              >
                {isAddingNote ? 'Saving...' : 'Save Note'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="pb-6">
          {notes ? (
            <div className="bg-card border rounded-lg p-6 shadow-sm whitespace-pre-wrap leading-relaxed text-sm text-foreground">
              {notes}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/40 mb-3">
                <StickyNote className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">No notes yet</p>
              <p className="text-xs opacity-70 mt-1">
                Add a note to keep track of important details.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
