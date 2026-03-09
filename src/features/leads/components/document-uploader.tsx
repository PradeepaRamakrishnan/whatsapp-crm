/** biome-ignore-all lint/performance/noImgElement: document preview requires img element */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  CreditCard,
  FileCheck,
  FileText,
  //   Image,
  //   Info,
  Trash2,
  Upload,
  X,
  // Loader2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
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
import { addTimelineEntry, deleteDocument, uploadDocument } from '../services';
import type { Document, TimelineEntry } from '../types';
import { DocumentType } from '../types';

interface DocumentUploaderProps {
  leadId: string;
  campaignId?: string;
  contactId?: string;
  initialDocuments?: Document[];
  timeline?: TimelineEntry[] | null;
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
  timeline,
  onUploadSuccess,
  isLoading: _isLoading,
}: DocumentUploaderProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeDocTypeRef = useRef<string | null>(null);

  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  // Sync documents with initialDocuments when it changes
  // Sync documents with initialDocuments when it changes
  useEffect(() => {
    // Update local state when prop changes, ensuring we have an array
    if (initialDocuments) {
      setDocuments(initialDocuments);
    } else {
      setDocuments([]);
    }
  }, [initialDocuments]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  const { mutate: deleteDoc, isPending: isDeleting } = useMutation({
    mutationFn: async (documentId: string) => {
      await deleteDocument(leadId, documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-documents', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads', leadId] });
      toast.success('Document deleted successfully');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [draggedDocType, setDraggedDocType] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

      // Add timeline entry logic
      let shouldAddEntry = true;
      let title = 'Document Uploaded';
      let description = `${newDoc.name} has been successfully uploaded.`;

      if (newDoc.type === DocumentType.AadharFront || newDoc.type === DocumentType.AadharBack) {
        // Aadhaar specific logic
        const otherType =
          newDoc.type === DocumentType.AadharFront
            ? DocumentType.AadharBack
            : DocumentType.AadharFront;

        // Check if the other side exists in the documents list (before the new one was added to state)
        const otherSideUploaded = documents.some((d) => d.type === otherType);

        if (otherSideUploaded) {
          title = 'Aadhaar Card Uploaded';
          description = 'Aadhaar Card (Front & Back) has been successfully uploaded.';
          shouldAddEntry = true;
        } else {
          // Only one side uploaded so far
          shouldAddEntry = false;
        }
      } else {
        // Generic logic for other documents
        switch (newDoc.type) {
          case 'pan':
            title = 'PAN Card Uploaded';
            description = 'PAN Card has been successfully uploaded.';
            break;
          case 'income_proof':
            title = 'Income Proof Uploaded';
            description = 'Income Proof has been successfully uploaded.';
            break;
          case 'bank_statement':
            title = 'Bank Statement Uploaded';
            description = 'Bank Statement has been successfully uploaded.';
            break;
          case 'address_proof':
            title = 'Address Proof Uploaded';
            description = 'Address Proof has been successfully uploaded.';
            break;
          default:
            title = `${newDoc.name} Uploaded`;
            description = `${newDoc.name} has been successfully uploaded.`;
        }
      }

      if (shouldAddEntry) {
        addTimelineEntry(
          leadId,
          { type: 'document_uploaded', title: title, description: description },
          timeline,
        ).catch(() => {});
      }
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

  // if (isLoading && documents.length === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center py-12 animate-pulse">
  //       <Loader2 className="size-8 text-primary animate-spin mb-3" />
  //       <p className="text-xs text-muted-foreground font-medium">
  //         Loading documents...
  //       </p>
  //     </div>
  //   );
  // }

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
          <CardContent className="p-4">
            <div className="space-y-6">
              {group.documents.map((doc, docIndex) => {
                const uploadedDoc = documents.find((d) => d.type === doc.id && d.fileUrl);

                let aadhaarDocs: Document[] = [];
                let isAadhaarComplete = false;
                let hasAtLeastOneAadhaar = false;

                if (doc.id === 'aadhaar') {
                  const frontDoc = documents.find(
                    (d) => d.type === DocumentType.AadharFront && d.fileUrl,
                  );
                  const backDoc = documents.find(
                    (d) => d.type === DocumentType.AadharBack && d.fileUrl,
                  );

                  aadhaarDocs = [frontDoc, backDoc].filter((d): d is Document => !!d);
                  hasAtLeastOneAadhaar = aadhaarDocs.length > 0;
                  isAadhaarComplete = !!frontDoc && !!backDoc;
                }

                const isSingleComplete = doc.id !== 'aadhaar' && !!uploadedDoc;
                const isAnyComplete = isAadhaarComplete || isSingleComplete;
                const canPreview = isSingleComplete || hasAtLeastOneAadhaar;

                return (
                  <div key={doc.id}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                            {doc.name}
                          </h3>
                          {isAnyComplete ? (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                              <CheckCircle2 className="size-3" />
                              <span className="text-[10px] font-bold  tracking-tight ">
                                Verified
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md border border-red-100 dark:border-red-800/50">
                              <X className="size-3" />
                              {/* <span className="text-[10px] font-bold  tracking-tight">Pending</span> */}
                            </div>
                          )}
                        </div>
                        {canPreview && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            disabled={isDeleting}
                            onClick={() => setDocToDelete({ id: doc.id, name: doc.name })}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
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
                                      : 'bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400',
                                  )}
                                >
                                  {item.data ? (
                                    <CheckCircle2 className="size-5" />
                                  ) : (
                                    <X className="size-5" />
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
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center mb-3 text-red-500 dark:text-red-400">
                              <Upload className="size-6" />
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              Upload {doc.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Drag & drop or click to browse
                            </p>
                          </button>
                        ))}

                      {canPreview && (
                        <div className="mt-4">
                          {doc.id === 'aadhaar' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {aadhaarDocs.map((aDoc) => (
                                <div key={aDoc.id} className="space-y-2">
                                  <p className="text-[10px] font-bold uppercase text-muted-foreground text-center tracking-wider">
                                    {aDoc.type === DocumentType.AadharFront
                                      ? 'Aadhaar Front'
                                      : 'Aadhaar Back'}
                                  </p>
                                  <div className="mx-auto w-fit max-w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm ring-1 ring-slate-950/5">
                                    {aDoc.fileUrl ? (
                                      aDoc.fileUrl.toLowerCase().split('?')[0].endsWith('.pdf') ? (
                                        <button
                                          type="button"
                                          className="cursor-pointer w-full"
                                          onClick={() => {
                                            if (aDoc.fileUrl) {
                                              setPreviewDocument({
                                                url: aDoc.fileUrl,
                                                name: aDoc.name,
                                                type: 'pdf',
                                              });
                                            }
                                          }}
                                        >
                                          <iframe
                                            src={`${aDoc.fileUrl}#toolbar=0`}
                                            className="w-[300px] sm:w-[500px] h-[400px] border-none pointer-events-none"
                                            title={aDoc.name}
                                          />
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          className="cursor-pointer"
                                          onClick={() => {
                                            if (aDoc.fileUrl) {
                                              setPreviewDocument({
                                                url: aDoc.fileUrl,
                                                name: aDoc.name,
                                                type: 'image',
                                              });
                                            }
                                          }}
                                        >
                                          <img
                                            src={aDoc.fileUrl}
                                            alt={aDoc.name}
                                            className="w-auto h-[250px] object-contain"
                                          />
                                        </button>
                                      )
                                    ) : (
                                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/50">
                                        <FileText className="size-8 mx-auto text-slate-300 mb-2" />
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase">
                                          File content unavailable
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase text-muted-foreground text-center tracking-wider">
                                {doc.name} Preview
                              </p>
                              <div className="mx-auto w-fit max-w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm ring-1 ring-slate-950/5">
                                {uploadedDoc?.fileUrl ? (
                                  uploadedDoc.fileUrl
                                    .toLowerCase()
                                    .split('?')[0]
                                    .endsWith('.pdf') ? (
                                    <button
                                      type="button"
                                      className="cursor-pointer w-full"
                                      onClick={() => {
                                        if (uploadedDoc.fileUrl) {
                                          setPreviewDocument({
                                            url: uploadedDoc.fileUrl,
                                            name: uploadedDoc.name,
                                            type: 'pdf',
                                          });
                                        }
                                      }}
                                    >
                                      <iframe
                                        src={`${uploadedDoc.fileUrl}#toolbar=0`}
                                        className="w-[300px] sm:w-[600px] h-[600px] border-none pointer-events-none"
                                        title={uploadedDoc.name}
                                      />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="cursor-pointer"
                                      onClick={() => {
                                        if (uploadedDoc.fileUrl) {
                                          setPreviewDocument({
                                            url: uploadedDoc.fileUrl,
                                            name: uploadedDoc.name,
                                            type: 'image',
                                          });
                                        }
                                      }}
                                    >
                                      <img
                                        src={uploadedDoc.fileUrl}
                                        alt={uploadedDoc.name}
                                        className="w-auto h-[400px] object-contain"
                                      />
                                    </button>
                                  )
                                ) : (
                                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/50">
                                    <FileText className="size-8 mx-auto text-slate-300 mb-2" />
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase">
                                      File content unavailable
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Add separator between documents, but not after the last one */}
                    {docIndex < group.documents.length - 1 && (
                      <div className="my-6 border-t border-slate-200 dark:border-slate-800" />
                    )}
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

      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {docToDelete?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                if (!docToDelete) return;

                try {
                  if (docToDelete.id === 'aadhaar') {
                    const heads = documents.filter(
                      (d) =>
                        d.type === DocumentType.AadharFront || d.type === DocumentType.AadharBack,
                    );
                    for (const d of heads) {
                      if (d.id) await deleteDocument(leadId, d.id);
                    }
                    // Filter out Aadhaar documents from local state immediately
                    setDocuments((prev) =>
                      prev.filter(
                        (d) =>
                          d.type !== DocumentType.AadharFront && d.type !== DocumentType.AadharBack,
                      ),
                    );
                    queryClient.invalidateQueries({
                      queryKey: ['lead-documents', leadId],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ['leads', leadId],
                    });
                    toast.success('Aadhaar documents deleted');
                  } else {
                    const uploadedDoc = documents.find(
                      (d) => d.type === docToDelete.id && d.fileUrl,
                    );
                    if (uploadedDoc?.id) {
                      // Also update local state for single docs
                      setDocuments((prev) => prev.filter((d) => d.id !== uploadedDoc.id));
                      deleteDoc(uploadedDoc.id);
                    }
                  }
                } catch (error) {
                  console.error('Delete failed:', error);
                  toast.error('Failed to delete document');
                } finally {
                  setDocToDelete(null);
                }
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!previewDocument} onOpenChange={(open) => !open && setPreviewDocument(null)}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>{previewDocument?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6">
            {previewDocument?.type === 'pdf' ? (
              <iframe
                src={`${previewDocument.url}#toolbar=0`}
                className="w-full h-full min-h-[70vh] border-none rounded-lg"
                title={previewDocument.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <img
                  src={previewDocument?.url || ''}
                  alt={previewDocument?.name || 'Document preview'}
                  className="max-w-full h-auto object-contain"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
