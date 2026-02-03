'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  CreditCard,
  Eye,
  FileCheck,
  FileText,
  //   Image,
  //   Info,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import type { Document } from '../types';
import { DocumentType } from '../types';

interface DocumentUploaderProps {
  leadId: string;
  campaignId?: string;
  contactId?: string;
  initialDocuments?: Document[];
  onUploadSuccess?: (doc: Document) => void;
  isLoading?: boolean;
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
        id: 'aadhaar',
        name: 'Aadhaar Card',
        description: 'Upload both front and back side of your Aadhaar card',
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
        id: 'pan',
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
        id: 'income_proof',
        name: 'Income Proof',
        description: "Latest 3 months' salary slips or ITR",
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
    id: 'others',
    title: 'Other Documents',
    description: 'Additional address proof or support files',
    icon: <FileText className="h-5 w-5" />,
    documents: [
      {
        id: 'address_proof',
        name: 'Address Proof',
        description: 'Recent utility bill or voter ID',
        instructions: [
          'Dated within last 3 months',
          'Current address must match applicant files',
          'All details clearly legible',
        ],
        formats: 'JPG, PNG, or PDF',
        maxSize: '5 MB',
      },
      {
        id: 'other',
        name: 'Other Support',
        description: 'Any other relevant verification files',
        instructions: [
          'Only if requested by agent',
          'Clearly label the file',
          'Ensure clear visibility',
        ],
        formats: 'JPG, PNG, or PDF',
        maxSize: '10 MB',
      },
    ],
  },
];

export function DocumentUploader({
  leadId,
  campaignId,
  contactId,
  initialDocuments = [],
  onUploadSuccess,
}: DocumentUploaderProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeDocTypeRef = useRef<string | null>(null);

  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  // Sync documents with initialDocuments when it changes
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | Document[] | null>(null);

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

  const uploadMutation = useMutation<Document, Error, { file: File; type: string; name: string }>({
    mutationFn: ({ file, type, name }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('name', name);
      if (campaignId) formData.append('campaignId', campaignId);
      if (contactId) formData.append('contactId', contactId);

      return uploadDocument(leadId, formData);
    },
    onSuccess: (newDoc) => {
      setDocuments([newDoc, ...documents]);
      setIsUploadModalOpen(false);
      setUploadFileName('');
      setSelectedFile(null);
      activeDocTypeRef.current = null;
      toast.success('Document uploaded successfully');
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['lead-documents', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      if (onUploadSuccess) onUploadSuccess(newDoc);
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
    <div className="space-y-6">
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
                const uploadedDoc = documents.find((d) => d.type === doc.id && d.fileUrl);

                let aadhaarDocs: Document[] = [];
                let isAadhaarComplete = false;

                if (doc.id === 'aadhaar') {
                  const frontDoc = documents.find(
                    (d) => d.type === DocumentType.AadharFront && d.fileUrl,
                  );
                  const backDoc = documents.find(
                    (d) => d.type === DocumentType.AadharBack && d.fileUrl,
                  );

                  if (frontDoc && backDoc) {
                    aadhaarDocs = [frontDoc, backDoc];
                    isAadhaarComplete = true;
                  }
                }

                const isSingleComplete = doc.id !== 'aadhaar' && !!uploadedDoc;
                const isAnyComplete = isAadhaarComplete || isSingleComplete;

                return (
                  <div key={doc.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                          {doc.name}
                        </h3>
                        {isAnyComplete && (
                          <CheckCircle2 className="size-5 text-green-600 dark:text-green-500 fill-green-100 dark:fill-green-900/30" />
                        )}
                      </div>
                      {isAnyComplete && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-[11px] font-bold uppercase tracking-tight"
                            onClick={() =>
                              setPreviewDoc(doc.id === 'aadhaar' ? aadhaarDocs : uploadedDoc!)
                            }
                          >
                            <Eye className="size-3.5 mr-1" />
                            View Files
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (doc.id === 'aadhaar') {
                                setDocuments(
                                  documents.filter(
                                    (d) =>
                                      d.type !== DocumentType.AadharFront &&
                                      d.type !== DocumentType.AadharBack,
                                  ),
                                );
                              } else {
                                setDocuments(documents.filter((d) => d.id !== uploadedDoc?.id));
                              }
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {!isAnyComplete && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {doc.description}
                      </p>
                    )}

                    {!isAnyComplete &&
                      (doc.id === 'aadhaar' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              side: DocumentType.AadharFront,
                              label: 'Front Side',
                              data: documents.find((d) => d.type === DocumentType.AadharFront),
                              dragging: draggedDocType === DocumentType.AadharFront,
                            },
                            {
                              side: DocumentType.AadharBack,
                              label: 'Back Side',
                              data: documents.find((d) => d.type === DocumentType.AadharBack),
                              dragging: draggedDocType === DocumentType.AadharBack,
                            },
                          ].map((item) => (
                            <button
                              key={item.side}
                              type="button"
                              className={cn(
                                'relative rounded-xl border-2 transition-all duration-200 text-left p-6 text-center',
                                item.data
                                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 font-medium'
                                  : item.dragging
                                    ? 'border-orange-400 dark:border-orange-600 border-dashed bg-orange-50 dark:bg-orange-950/30'
                                    : 'border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/30 dark:hover:bg-orange-950/10',
                              )}
                              onDragOver={(e) => !item.data && handleDragOver(e, item.side)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => !item.data && handleDrop(e, item.side)}
                              onClick={() => !item.data && handleFileUploadTrigger(item.side)}
                            >
                              <div
                                className={cn(
                                  'mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2',
                                  item.data
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                                )}
                              >
                                {item.data ? (
                                  <CheckCircle2 className="size-5" />
                                ) : (
                                  <Upload className="size-5" />
                                )}
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {item.label}
                              </h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {item.data ? 'Uploaded' : 'Click to Upload'}
                              </p>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={cn(
                            'relative rounded-xl border-2 transition-all duration-200 text-left w-full p-8 text-center',
                            draggedDocType === doc.id
                              ? 'border-orange-400 dark:border-orange-600 border-dashed bg-orange-50 dark:bg-orange-950/30'
                              : 'border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/30 dark:hover:bg-orange-950/10',
                          )}
                          onDragOver={(e) => handleDragOver(e, doc.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, doc.id)}
                          onClick={() => handleFileUploadTrigger(doc.id)}
                        >
                          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                            <Upload className="size-6 text-slate-500 dark:text-slate-400" />
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            Upload {doc.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Drag & drop or click to browse
                          </p>
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,.pdf"
      />

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Upload</DialogTitle>
            <DialogDescription>Confirm your selected document.</DialogDescription>
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

      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle>
                  {Array.isArray(previewDoc) ? 'Document Collection' : previewDoc?.name}
                </DialogTitle>
                <DialogDescription>
                  {Array.isArray(previewDoc)
                    ? `${previewDoc.length} files attached`
                    : 'Securely stored verification file'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-muted/30 p-6 overflow-auto">
            {Array.isArray(previewDoc) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start h-full">
                {previewDoc.map((doc, idx) => (
                  <div key={doc.id || idx} className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
                      {idx === 0 ? 'Front View' : 'Back View'}
                    </p>
                    <div className="bg-white rounded-lg shadow-xl border overflow-hidden">
                      {doc.fileUrl ? (
                        <img
                          src={doc.fileUrl}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-auto object-contain mx-auto"
                        />
                      ) : (
                        <div className="text-center p-8 space-y-4">
                          <FileText className="size-12 text-muted-foreground/30 mx-auto" />
                          <p className="text-xs text-muted-foreground font-bold tracking-wide uppercase">
                            File not available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                {previewDoc?.fileUrl &&
                (previewDoc.fileUrl.startsWith('blob:') ||
                  previewDoc.fileUrl.includes('image') ||
                  previewDoc.fileUrl.endsWith('.png') ||
                  previewDoc.fileUrl.endsWith('.jpg') ||
                  previewDoc.fileUrl.includes('googleusercontent')) ? (
                  <img
                    src={previewDoc.fileUrl}
                    alt="Document Preview"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border bg-white mx-auto"
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <FileText className="size-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground font-bold tracking-wide uppercase">
                      Preview not available
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
