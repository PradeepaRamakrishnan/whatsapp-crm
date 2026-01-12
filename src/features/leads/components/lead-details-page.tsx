/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Eye,
  FileCheck,
  FileText,
  Image,
  Info,
  Link2,
  Phone,
  Trash2,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
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
import { ContactConversation } from '@/features/campaigns/components/contact-conversation';
import { cn } from '@/lib/utils';
import { borrowersData, type Document as LeadDocument } from '../lib/data';
import { ContactDetailsPage } from './contact-detail';

// const getStatusColor = (status: string) => {
//   switch (status.toLowerCase()) {
//     case 'processing':
//       return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900';
//     case 'eligible':
//       return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900';
//     case 'in review':
//       return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900';
//     default:
//       return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-900';
//   }
// };

interface LeadDetailsPageProps {
  leadId: number;
}

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  formats: string;
  maxSize: string;
  icon?: React.ReactNode;
}

interface DocumentGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  documents: DocumentRequirement[];
}

const DOCUMENT_GROUPS: DocumentGroup[] = [
  {
    id: 'identity',
    title: 'Identity Verification',
    description: 'Government-issued identity documents for KYC compliance',
    icon: <CreditCard className="h-5 w-5" />,
    documents: [
      {
        id: 'aadhar',
        name: 'Aadhar Card',
        description: 'Upload both front and back side of your Aadhar card',
        instructions: [
          'Ensure all 12 digits are clearly visible and readable',
          'No blur, glare, or shadows on the card',
          'All four corners of the card should be visible',
          'Text and photo should be sharp and legible',
        ],
        formats: 'JPG, PNG, or PDF',
        maxSize: '5 MB per side',
      },
    ],
  },
  {
    id: 'financial',
    title: 'Financial Documents',
    description: 'Documents to verify your financial status and income',
    icon: <FileCheck className="h-5 w-5" />,
    documents: [
      {
        id: 'pan_card',
        name: 'PAN Card',
        description: 'Permanent Account Number card issued by Income Tax Department',
        instructions: [
          'PAN number should be clearly visible',
          'Name and date of birth must be legible',
          'No lamination glare or reflections',
          'Photograph should be clear',
        ],
        formats: 'JPG, PNG, or PDF',
        maxSize: '5 MB',
      },
      {
        id: 'salary_slip',
        name: 'Latest Salary Slip',
        description: "Most recent month's salary slip from your employer",
        instructions: [
          'Must be for the most recent month',
          'Should include employer name and logo',
          'Basic salary and deductions clearly mentioned',
          'Employee ID and name should be visible',
        ],
        formats: 'PDF preferred, JPG/PNG accepted',
        maxSize: '10 MB',
      },
      {
        id: 'bank_statement',
        name: 'Bank Statement',
        description: 'Last 6 months transaction history from your primary bank account',
        instructions: [
          'Must cover the last 6 months period',
          'Should be an official bank statement (not screenshots)',
          'Account holder name must match applicant name',
          'All pages should be included if multi-page document',
        ],
        formats: 'PDF format only',
        maxSize: '15 MB',
      },
    ],
  },
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Recent photograph for profile verification',
    icon: <Image className="h-5 w-5" />,
    documents: [
      {
        id: 'photo',
        name: 'Passport Size Photo',
        description: 'Recent color photograph with plain background',
        instructions: [
          'Taken within the last 6 months',
          'Plain white or light-colored background',
          'Face should be clearly visible, looking at camera',
          'No sunglasses, hats, or heavy filters',
        ],
        formats: 'JPG or PNG',
        maxSize: '2 MB',
      },
    ],
  },
];

export function LeadDetailsPage({ leadId }: LeadDetailsPageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeDocTypeRef = useRef<string | null>(null);

  const lead = useMemo(() => {
    return borrowersData.find((l) => l.id === leadId);
  }, [leadId]);

  // const [notes, setNotes] = useState<Note[]>(
  //   lead?.notes || [
  //     {
  //       id: '1',
  //       type: 'message',
  //       content: 'Initial inquiry received via system.',
  //       timestamp: lead?.applicationDate || new Date().toISOString(),
  //       author: 'System',
  //     },
  //     {
  //       id: '2',
  //       type: 'note',
  //       content: 'Client mentioned they need the funds for business expansion. High urgency case.',
  //       timestamp: new Date().toISOString(),
  //       author: 'Admin',
  //     },
  //   ],
  // );

  const [documents, setDocuments] = useState<LeadDocument[]>([]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [draggedDocType, setDraggedDocType] = useState<string | null>(null);

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

  const handleDragOver = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedDocType(docType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedDocType(null);
  };

  const handleDrop = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedDocType(null);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      activeDocTypeRef.current = docType;
      setUploadFileName(file.name);
      setIsUploadModalOpen(true);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
              {/* <Badge className={cn('border', getStatusColor(lead.status || 'Processing'))} variant="secondary">
                {lead.status || 'Processing'}
              </Badge> */}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  Inquiry Date: {new Date(lead.applicationDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>ID: L-{lead.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settlement Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ₹{lead.loanAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">Primary loan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settlement Count</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lead.settlementCount}</div>
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
                lead.dndStatus ? 'text-red-600' : 'text-emerald-600',
              )}
            >
              {lead.dndStatus ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">Do Not Disturb</p>
          </CardContent>
        </Card>
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
          <TabsTrigger
            value="conversation"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          >
            Conversation
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="pt-6">
          <ContactDetailsPage contact={lead} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="pt-6">
          <div className="space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-xl">Required Documents</CardTitle>
                    <CardDescription className="mt-1.5">
                      Collect necessary documentation from the borrower for KYC and verification
                    </CardDescription>
                  </div>
                  <Button>
                    <Link2 className="mr-2 h-4 w-4" />
                    Send Secured Upload Link
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Document Groups */}
            {DOCUMENT_GROUPS.map((group) => (
              <Card key={group.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                      {group.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{group.title}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {group.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {group.documents.map((doc) => {
                      // Special handling for Aadhar card
                      if (doc.id === 'aadhar') {
                        const frontDoc = documents.find((d) => d.type === 'aadhar_front');
                        const backDoc = documents.find((d) => d.type === 'aadhar_back');
                        const isDraggingFront = draggedDocType === 'aadhar_front';
                        const isDraggingBack = draggedDocType === 'aadhar_back';

                        return (
                          <div key={doc.id} className="space-y-4">
                            {/* Document Title and Description */}
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                                {doc.name}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {doc.description}
                              </p>
                            </div>

                            {/* Upload Requirements */}
                            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                <div className="space-y-2 flex-1">
                                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Upload Requirements
                                  </p>
                                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                    {doc.instructions.map((instruction) => (
                                      <li key={instruction} className="flex items-start gap-2">
                                        <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                                          •
                                        </span>
                                        <span>{instruction}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="flex items-center gap-4 pt-2 text-xs text-blue-700 dark:text-blue-300">
                                    <span className="font-medium">Accepted: {doc.formats}</span>
                                    <span className="text-blue-400 dark:text-blue-600">•</span>
                                    <span className="font-medium">Max size: {doc.maxSize}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Side-by-side upload zones for Aadhar */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Front Side */}

                              <div
                                className={cn(
                                  'relative rounded-xl border-2 transition-all duration-200 text-left',
                                  frontDoc
                                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                                    : isDraggingFront
                                      ? 'border-orange-400 dark:border-orange-600 border-dashed bg-orange-50 dark:bg-orange-950/30'
                                      : 'border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/30 dark:hover:bg-orange-950/10',
                                )}
                                onDragOver={(e) => !frontDoc && handleDragOver(e, 'aadhar_front')}
                                onDragLeave={(e) => !frontDoc && handleDragLeave(e)}
                                onDrop={(e) => !frontDoc && handleDrop(e, 'aadhar_front')}
                              >
                                <div className="p-6 text-center">
                                  <div
                                    className={cn(
                                      'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3',
                                      frontDoc
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                        : isDraggingFront
                                          ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                                    )}
                                  >
                                    <CreditCard className="h-6 w-6" />
                                  </div>
                                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                    Front Side
                                  </h4>
                                  {frontDoc ? (
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                          Uploaded
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate px-4">
                                        {frontDoc.name}
                                      </p>
                                      <div className="flex items-center justify-center gap-2 pt-2">
                                        <Button size="sm" variant="outline">
                                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                                          View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                          onClick={() =>
                                            setDocuments(
                                              documents.filter((d) => d.id !== frontDoc.id),
                                            )
                                          }
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {isDraggingFront
                                          ? 'Release to upload'
                                          : 'Drag & drop or click to upload'}
                                      </p>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => handleFileUploadTrigger('aadhar_front')}
                                      >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose File
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Back Side */}

                              <div
                                className={cn(
                                  'relative rounded-xl border-2 transition-all duration-200 text-left',
                                  backDoc
                                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                                    : isDraggingBack
                                      ? 'border-orange-400 dark:border-orange-600 border-dashed bg-orange-50 dark:bg-orange-950/30'
                                      : 'border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/30 dark:hover:bg-orange-950/10',
                                )}
                                onDragOver={(e) => !backDoc && handleDragOver(e, 'aadhar_back')}
                                onDragLeave={(e) => !backDoc && handleDragLeave(e)}
                                onDrop={(e) => !backDoc && handleDrop(e, 'aadhar_back')}
                              >
                                <div className="p-6 text-center">
                                  <div
                                    className={cn(
                                      'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3',
                                      backDoc
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                        : isDraggingBack
                                          ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                                    )}
                                  >
                                    <CreditCard className="h-6 w-6" />
                                  </div>
                                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                    Back Side
                                  </h4>
                                  {backDoc ? (
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                          Uploaded
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate px-4">
                                        {backDoc.name}
                                      </p>
                                      <div className="flex items-center justify-center gap-2 pt-2">
                                        <Button size="sm" variant="outline">
                                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                                          View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                          onClick={() =>
                                            setDocuments(
                                              documents.filter((d) => d.id !== backDoc.id),
                                            )
                                          }
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {isDraggingBack
                                          ? 'Release to upload'
                                          : 'Drag & drop or click to upload'}
                                      </p>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => handleFileUploadTrigger('aadhar_back')}
                                      >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose File
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Regular document upload (single file)
                      const uploadedDoc = documents.find((d) => d.type === doc.id);
                      const isDragging = draggedDocType === doc.id;

                      return (
                        <div key={doc.id} className="space-y-4">
                          {/* Document Title and Description */}
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                              {doc.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {doc.description}
                            </p>
                          </div>

                          {/* Upload Requirements */}
                          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                              <div className="space-y-2 flex-1">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  Upload Requirements
                                </p>
                                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                  {doc.instructions.map((instruction) => (
                                    <li key={instruction} className="flex items-start gap-2">
                                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                                        •
                                      </span>
                                      <span>{instruction}</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="flex items-center gap-4 pt-2 text-xs text-blue-700 dark:text-blue-300">
                                  <span className="font-medium">Accepted: {doc.formats}</span>
                                  <span className="text-blue-400 dark:text-blue-600">•</span>
                                  <span className="font-medium">Max size: {doc.maxSize}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Upload Zone */}

                          <div
                            className={cn(
                              'relative rounded-xl border-2 transition-all duration-200 text-left w-full',
                              uploadedDoc
                                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                                : isDragging
                                  ? 'border-orange-400 dark:border-orange-600 border-dashed bg-orange-50 dark:bg-orange-950/30'
                                  : 'border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/30 dark:hover:bg-orange-950/10',
                            )}
                            onDragOver={(e) => !uploadedDoc && handleDragOver(e, doc.id)}
                            onDragLeave={(e) => !uploadedDoc && handleDragLeave(e)}
                            onDrop={(e) => !uploadedDoc && handleDrop(e, doc.id)}
                          >
                            <div className="p-8 text-center">
                              <div
                                className={cn(
                                  'mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4',
                                  uploadedDoc
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                    : isDragging
                                      ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                                )}
                              >
                                <FileText className="h-7 w-7" />
                              </div>
                              {uploadedDoc ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                                      Document Uploaded
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {uploadedDoc.name}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-500">
                                    {uploadedDoc.size} • Uploaded on{' '}
                                    {new Date(uploadedDoc.uploadDate).toLocaleDateString('en-IN')}
                                  </p>
                                  <div className="flex items-center justify-center gap-3 pt-3">
                                    <Button size="sm" variant="outline">
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Document
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white"
                                      onClick={() =>
                                        setDocuments(
                                          documents.filter((d) => d.id !== uploadedDoc.id),
                                        )
                                      }
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">
                                      {isDragging
                                        ? 'Release to upload file'
                                        : 'Drop your file here'}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      or click the button below to browse
                                    </p>
                                  </div>
                                  <Button
                                    size="default"
                                    onClick={() => handleFileUploadTrigger(doc.id)}
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File to Upload
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf"
            />
          </div>
        </TabsContent>

        <TabsContent value="conversation" className="mt-6">
          <ContactConversation contact={lead} />
        </TabsContent>
      </Tabs>

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
