'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  IndianRupee,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  Upload,
  //   Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { interestedLeadsData, type Document as LeadDocument, type Note } from '../lib/data';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900';
    case 'eligible':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900';
    case 'in review':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-900';
  }
};

interface LeadDetailsPageProps {
  leadId: number;
}

const REQUIRED_DOCUMENTS = [
  { id: 'aadhar_front', name: 'Aadhar Card (Front)', description: 'Clear photo of the front side' },
  { id: 'aadhar_back', name: 'Aadhar Card (Back)', description: 'Clear photo of the back side' },
  { id: 'pan_card', name: 'PAN Card', description: 'Clear photo of your PAN card' },
  { id: 'salary_slip', name: 'Latest Salary Slip', description: 'Most recent month salary slip' },
  {
    id: 'bank_statement',
    name: 'Bank Statement',
    description: 'Last 6 months bank statement (PDF)',
  },
  { id: 'photo', name: 'Passport Size Photo', description: 'Recent color photograph' },
];

export function LeadDetailsPage({ leadId }: LeadDetailsPageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeDocTypeRef = useRef<string | null>(null);

  const lead = useMemo(() => {
    return interestedLeadsData.find((l) => l.id === leadId);
  }, [leadId]);

  const [notes, setNotes] = useState<Note[]>(
    lead?.notes || [
      {
        id: '1',
        type: 'message',
        content: 'Initial inquiry received via system.',
        timestamp: lead?.createdDate || new Date().toISOString(),
        author: 'System',
      },
      {
        id: '2',
        type: 'note',
        content: 'Client mentioned they need the funds for business expansion. High urgency case.',
        timestamp: new Date().toISOString(),
        author: 'Admin',
      },
    ],
  );

  const [documents, setDocuments] = useState<LeadDocument[]>(lead?.documents || []);

  // Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteType, setNoteType] = useState<'note' | 'message'>('note');
  const [newNoteContent, setNewNoteContent] = useState('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');

  if (!lead) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Lead not found</h2>
          <p className="text-sm text-muted-foreground">
            The lead you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      type: noteType,
      content: newNoteContent,
      timestamp: new Date().toISOString(),
      author: 'Admin',
    };

    setNotes([newNote, ...notes]);
    setNewNoteContent('');
    setIsNoteModalOpen(false);
  };

  const handleFileUploadTrigger = (docType: string) => {
    activeDocTypeRef.current = docType;
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      setIsUploadModalOpen(true);
    }
  };

  const confirmUpload = () => {
    const newDoc: LeadDocument = {
      id: Date.now().toString(),
      name: uploadFileName,
      type: activeDocTypeRef.current || 'other',
      url: '#',
      uploadDate: new Date().toISOString(),
      size: '1.2 MB', // Mock size
    };

    setDocuments([newDoc, ...documents]);
    setIsUploadModalOpen(false);
    setUploadFileName('');
    activeDocTypeRef.current = null;
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
              <Badge className={cn('border', getStatusColor(lead.status))} variant="secondary">
                {lead.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Inquiry Date: {new Date(lead.createdDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>ID: L-{lead.id}</span>
              </div>
            </div>
          </div>

          {/* <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { setNoteType('message'); setIsNoteModalOpen(true); }}>
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
              <CheckCircle2 className="h-4 w-4" />
              Mark as Qualified
            </Button>
          </div> */}
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="inline-flex h-11 items-center justify-start gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/50 p-1 w-auto">
          <TabsTrigger
            value="overview"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          >
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="pt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Conversation */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversation History</CardTitle>
                  <CardDescription>All interactions with this lead</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className={cn(
                          'flex gap-4 p-4 rounded-lg border',
                          note.type === 'message'
                            ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                            : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30',
                        )}
                      >
                        <div className="mt-1">
                          <div
                            className={cn(
                              'h-10 w-10 rounded-full flex items-center justify-center',
                              note.type === 'message'
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'bg-orange-100 dark:bg-orange-900',
                            )}
                          >
                            {note.type === 'message' ? (
                              <Clock className="h-5 w-5 text-blue-600" />
                            ) : (
                              <MessageSquare className="h-5 w-5 text-orange-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold">
                              {note.type === 'message' ? 'Update' : 'Internal Note'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(note.timestamp).toLocaleString('en-IN')}
                            </p>
                          </div>
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Added by {note.author}
                          </p>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setNoteType('note');
                        setIsNoteModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Note or Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Cards */}
            <div className="lg:col-span-1 space-y-6">
              {/* Loan Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Loan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-950/30">
                      <IndianRupee className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount Requested</p>
                      <p className="text-lg font-bold">
                        ₹{lead.loanAmountRequested.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{lead.phoneNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">Documents Uploaded</p>
                        <p className="text-xs text-muted-foreground">Total files</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {documents.length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="pt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Required Documents</CardTitle>
                  <CardDescription>
                    Collect necessary documentation from the borrower
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Send Documents to Borrower
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {REQUIRED_DOCUMENTS.map((docReq) => {
                  const uploadedDoc = documents.find((d) => d.type === docReq.id);

                  return (
                    <div
                      key={docReq.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg mt-0.5',
                            uploadedDoc
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-200 text-slate-500',
                          )}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {docReq.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{docReq.description}</p>
                          {uploadedDoc && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0"
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Uploaded
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {uploadedDoc.name} ({uploadedDoc.size})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {uploadedDoc ? (
                          <>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                setDocuments(documents.filter((d) => d.id !== uploadedDoc.id))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-slate-900 text-white hover:bg-slate-800"
                            onClick={() => handleFileUploadTrigger(docReq.id)}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hidden file input for logic */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Note/Message Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{noteType === 'note' ? 'Add Internal Note' : 'Send Message'}</DialogTitle>
            <DialogDescription>
              {noteType === 'note'
                ? 'Add a private note for other team members to see.'
                : 'Send a message or record a conversation update for this lead.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Content</Label>
              <Textarea
                id="note"
                placeholder={
                  noteType === 'note'
                    ? 'Enter internal notes here...'
                    : 'Type your message or update...'
                }
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleAddNote}
            >
              {noteType === 'note' ? 'Save Note' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Confirmation Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Upload</DialogTitle>
            <DialogDescription>Confirming upload for your selected document.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="docName">File Name</Label>
              <Input
                id="docName"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={confirmUpload}
            >
              Finish Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
