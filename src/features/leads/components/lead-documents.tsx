/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  CreditCard,
  Eye,
  FileCheck,
  FileText,
  Image,
  Info,
  Link2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
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
import { cn } from '@/lib/utils';
import { uploadDocument } from '../services';
import type { Document as LeadDocument } from '../types';

interface LeadDocumentsProps {
  leadId: string;
  campaignId?: string;
  contactId?: string;
  initialDocuments?: LeadDocument[];
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

export function LeadDocuments({
  leadId,
  campaignId,
  contactId,
  initialDocuments = [],
}: LeadDocumentsProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeDocTypeRef = useRef<string | null>(null);

  const [documents, setDocuments] = useState<LeadDocument[]>(initialDocuments);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<LeadDocument | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [draggedDocType, setDraggedDocType] = useState<string | null>(null);

  const handleFileUploadTrigger = (docType: string) => {
    activeDocTypeRef.current = docType;
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadFileName(file.name);
      setIsUploadModalOpen(true);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: ({ file, type, name }: { file: File; type: string; name: string }) =>
      uploadDocument(leadId, type, name, file, campaignId, contactId),
    onSuccess: (newDoc) => {
      setDocuments([newDoc, ...documents]);
      setIsUploadModalOpen(false);
      setUploadFileName('');
      setSelectedFile(null);
      activeDocTypeRef.current = null;
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    },
  });

  const confirmUpload = () => {
    if (!selectedFile || !activeDocTypeRef.current) return;

    uploadMutation.mutate({
      file: selectedFile,
      type: activeDocTypeRef.current,
      name: uploadFileName,
    });
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
      setSelectedFile(file);
      setUploadFileName(file.name);
      setIsUploadModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 mt-4">
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
                <CardDescription className="text-xs mt-0.5">{group.description}</CardDescription>
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
                                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewDoc(frontDoc);
                                    }}
                                  >
                                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDocuments(documents.filter((d) => d.id !== frontDoc.id));
                                    }}
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewDoc(backDoc);
                                    }}
                                  >
                                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDocuments(documents.filter((d) => d.id !== backDoc.id));
                                    }}
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
                                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDoc(uploadedDoc);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Document
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDocuments(documents.filter((d) => d.id !== uploadedDoc.id));
                                }}
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
                                {isDragging ? 'Release to upload file' : 'Drop your file here'}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                or click the button below to browse
                              </p>
                            </div>
                            <Button size="default" onClick={() => handleFileUploadTrigger(doc.id)}>
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
            <Button onClick={confirmUpload} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading...' : 'Finish Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle>{previewDoc?.name}</DialogTitle>
                <DialogDescription>
                  Uploaded on{' '}
                  {previewDoc && new Date(previewDoc.uploadDate).toLocaleDateString('en-IN')}
                </DialogDescription>
              </div>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={previewDoc?.url}
                  download={previewDoc?.name}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 min-h-0">
            {previewDoc?.url.startsWith('blob:') || previewDoc?.url.includes('image') ? (
              <img
                src={previewDoc.url}
                alt={previewDoc.name}
                className="max-w-full max-h-full object-contain shadow-lg rounded-sm"
              />
            ) : (
              <div className="text-center p-12">
                <FileText className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Preview not available for this file type.
                </p>
                <Button variant="link" asChild className="mt-2">
                  <a href={previewDoc?.url} target="_blank" rel="noreferrer">
                    Open in new tab
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
