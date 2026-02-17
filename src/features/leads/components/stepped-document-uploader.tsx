'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  FileCheck,
  FileText,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { deleteDocument, getDocuments, updateLead, uploadDocument } from '../services';
import type { Document } from '../types';
import { DocumentType, DocumentUploadSchema } from '../types';

interface SteppedDocumentUploaderProps {
  leadId: string;
  campaignId?: string;
  contactId?: string;
  initialDocuments?: Document[];
}

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  formats: string;
  maxSize: string;
  icon?: React.ReactNode;
  required?: boolean; // Added required flag
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
    title: 'Identity & KYC',
    description: 'Government-issued identity and tax documents',
    icon: <CreditCard className="size-4" />,
    documents: [
      {
        id: 'aadhaar',
        name: 'Aadhaar Card',
        description: 'Upload both front and back side of your Aadhaar card',
        instructions: [
          'Ensure all 12 digits are clearly visible',
          'All four corners should be visible',
          'Text and photo should be sharp and legible',
        ],
        formats: 'JPG, PNG, or PDF',
        maxSize: '5 MB per side',
        required: true,
      },
      {
        id: 'pan',
        name: 'PAN Card',
        description: 'Permanent Account Number card',
        instructions: [
          'PAN number should be clearly visible',
          'Name and DOB must be legible',
          'No lamination glare',
        ],
        formats: 'JPG, PNG, or PDF',
        maxSize: '5 MB',
        required: true,
      },
    ],
  },
  {
    id: 'financial',
    title: 'Financial',
    description: 'Verify your financial status and income',
    icon: <FileCheck className="size-4" />,
    documents: [
      {
        id: 'income_proof',
        name: 'Income Proof',
        description: "Latest 3 months' salary slips or ITR",
        instructions: [
          'Must be for the most recent periods',
          'Should include employer name or IT department logo',
          'Income details clearly visible',
        ],
        formats: 'PDF preferred, JPG/PNG accepted',
        maxSize: '10 MB',
        required: true,
      },
      {
        id: 'bank_statement',
        name: 'Bank Statement',
        description: 'Last 6 months transaction history',
        instructions: [
          'Must cover the last 6 months period',
          'Account holder name must match applicant',
          'All pages should be included',
        ],
        formats: 'PDF format only',
        maxSize: '15 MB',
        required: true,
      },
      {
        id: 'loan_statement',
        name: 'Loan Statement',
        description: 'Existing loan details or SOA',
        instructions: [
          'Should show current outstanding balance',
          'Interest rate and tenure details',
          'Recent payment history',
        ],
        formats: 'PDF or JPG',
        maxSize: '10 MB',
        required: false,
      },
    ],
  },
  {
    id: 'others',
    title: 'Others',
    description: 'Additional address proof or support files',
    icon: <FileText className="size-4" />,
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
        required: false,
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
        required: false,
      },
    ],
  },
];

export function SteppedDocumentUploader({
  leadId,
  campaignId,
  contactId,
  initialDocuments = [],
}: SteppedDocumentUploaderProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeDocTypeRef = useRef<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  // Fetch documents from API if they exist
  const { data: documentsData, isLoading: isDocsLoading } = useQuery({
    queryKey: ['lead-documents', leadId],
    queryFn: () => getDocuments(leadId),
    enabled: !!leadId,
  });

  // Sync documents state when data is fetched
  useEffect(() => {
    if (documentsData?.documents) {
      setDocuments(documentsData.documents);
    }
  }, [documentsData]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | Document[] | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [draggedDocType, setDraggedDocType] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const activeGroup = DOCUMENT_GROUPS[currentStep];
  const progress = ((currentStep + 1) / DOCUMENT_GROUPS.length) * 100;

  // Reset errors when step changes
  useEffect(() => {
    setShowErrors(false);
  }, []);

  const handleFileUploadTrigger = (docType: string) => {
    activeDocTypeRef.current = docType;
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocTypeRef.current) {
      setSelectedFile(file);
      setUploadFileName(file.name);
      setIsUploadModalOpen(true);
      setFieldErrors({}); // Reset errors
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
      queryClient.invalidateQueries({ queryKey: ['lead-documents', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      // Reset error for this specific type if it was showing
      setShowErrors(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    },
  });

  const submitFinalMutation = useMutation({
    mutationFn: () => updateLead(leadId, { status: 'documents_collected' }),
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success('Registration completed! All documents submitted.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to finalize submission');
    },
  });

  const confirmUpload = () => {
    if (!selectedFile || !activeDocTypeRef.current) return;

    // Map the trigger type to the correct DocumentType enum
    let docType: DocumentType;

    if (activeDocTypeRef.current === 'aadhaar_front') {
      docType = DocumentType.AadharFront;
    } else if (activeDocTypeRef.current === 'aadhaar_back') {
      docType = DocumentType.AadharBack;
    } else if (activeDocTypeRef.current === 'pan') {
      docType = DocumentType.Pan;
    } else if (activeDocTypeRef.current === 'income_proof') {
      docType = DocumentType.IncomeProof;
    } else if (activeDocTypeRef.current === 'bank_statement') {
      docType = DocumentType.BankStatement;
    } else if (activeDocTypeRef.current === 'address_proof') {
      docType = DocumentType.AddressProof;
    } else if (activeDocTypeRef.current === 'loan_statement') {
      docType = DocumentType.LoanStatement;
    } else {
      docType = DocumentType.Other;
    }

    const result = DocumentUploadSchema.safeParse({
      name: uploadFileName,
      file: selectedFile,
      type: docType,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errors[issue.path[0].toString()] = issue.message;
      });
      setFieldErrors(errors);
      toast.error(Object.values(errors)[0] || 'Validation failed');
      return;
    }

    uploadMutation.mutate({
      file: selectedFile,
      type: docType,
      name: uploadFileName,
    });
  };

  const { mutate: deleteDoc, isPending: isDeleting } = useMutation({
    mutationFn: async (documentId: string) => {
      await deleteDocument(leadId, documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-documents', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      toast.success('Document deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });

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
      setFieldErrors({});
    }
  };

  const isStepComplete = (groupId: string) => {
    const group = DOCUMENT_GROUPS.find((g) => g.id === groupId);
    if (!group) return false;
    return group.documents.every((doc) => {
      if (!doc.required) return true;
      if (doc.id === 'aadhaar') {
        const hasFront = documents.some((d) => d.type === DocumentType.AadharFront);
        const hasBack = documents.some((d) => d.type === DocumentType.AadharBack);
        return hasFront && hasBack;
      }
      return documents.some((d) => d.type === doc.id);
    });
  };

  const nextStep = () => {
    if (!isStepComplete(activeGroup.id)) {
      setShowErrors(true);
      const group = DOCUMENT_GROUPS.find((g) => g.id === activeGroup.id);
      const missingDocs = group?.documents
        .filter((doc) => {
          if (!doc.required) return false;
          if (doc.id === 'aadhaar') {
            return documents.filter((d) => d.type === DocumentType.Aadhar).length < 2;
          }
          return !documents.some((d) => d.type === doc.id);
        })
        .map((d) => d.name)
        .join(', ');

      toast.error(`Please upload required documents: ${missingDocs}`, {
        icon: <AlertCircle className="size-4 text-destructive" />,
      });
      return;
    }

    if (currentStep < DOCUMENT_GROUPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      submitFinalMutation.mutate();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="size-24 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-200">
          <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100  tracking-tight">
            Success!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Your documents have been received successfully. Our verification team will review them
            and update your status shortly.
          </p>
        </div>
        <div className="pt-4">
          <Button
            className="w-full rounded-xl h-12 font-bold  tracking-widest shadow-lg shadow-primary/20"
            onClick={() => window.location.reload()}
          >
            Return to Portal
          </Button>
        </div>
        <div className="pt-12 border-t text-[10px] text-muted-foreground  tracking-[0.2em] font-bold opacity-50">
          ID: {leadId.substring(0, 12).toUpperCase()} • Samatva Secure
        </div>
      </div>
    );
  }

  if (isDocsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="size-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground font-medium">Loading your documents...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-primary tracking-widest capitalize">
              Step {currentStep + 1} of {DOCUMENT_GROUPS.length}
            </h2>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {activeGroup.title} Upload
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
            <ShieldCheck className="size-3.5" />
            <span className="text-[10px] font-bold tracking-wider">Secure Portal</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
        </div>

        <div className="pt-2">
          <Tabs
            value={activeGroup.id}
            onValueChange={(val) => {
              const index = DOCUMENT_GROUPS.findIndex((g) => g.id === val);
              if (index !== -1) setCurrentStep(index);
            }}
            className="w-full"
          >
            <TabsList className="w-full justify-start border-b h-auto p-0 gap-8 bg-transparent transition-none">
              {DOCUMENT_GROUPS.map((group, index) => {
                const isActive = currentStep === index;
                const isCompleted = isStepComplete(group.id);
                return (
                  <TabsTrigger
                    key={group.id}
                    value={group.id}
                    className={cn(
                      'px-0 pb-3 pt-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent text-sm font-semibold transition-none',
                      isCompleted && !isActive && 'text-emerald-600 dark:text-emerald-400',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isCompleted ? <CheckCircle2 className="size-3.5" /> : group.icon}
                      {group.title}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-white dark:bg-slate-900/50 rounded-xl border p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-muted/30 border rounded-lg">
              <Info className="size-4 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-widest text-foreground">
                  Requirement Details
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activeGroup.description}. Please ensure documents are original and clearly
                  visible.
                </p>
              </div>
            </div>

            <div className="space-y-10">
              {activeGroup.documents.map((doc) => {
                const uploadedDoc = documents.find((d) => d.type === doc.id);
                const aadhaarDocs =
                  doc.id === 'aadhaar'
                    ? documents
                        .filter(
                          (d) =>
                            d.type === DocumentType.AadharFront ||
                            d.type === DocumentType.AadharBack,
                        )
                        .sort((a, b) => (a.type === DocumentType.AadharFront ? -1 : 1))
                    : [];
                const isAadhaarComplete =
                  doc.id === 'aadhaar' &&
                  documents.some((d) => d.type === DocumentType.AadharFront) &&
                  documents.some((d) => d.type === DocumentType.AadharBack);
                const isSingleComplete = doc.id !== 'aadhaar' && uploadedDoc;
                const isAnyComplete = isAadhaarComplete || isSingleComplete;

                return (
                  <div key={doc.id} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight text-primary">
                            {doc.name}
                          </h3>
                          {isAnyComplete ? (
                            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-full animate-in zoom-in-95 duration-300">
                              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400  tracking-tight ">
                                Verified
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-2.5 py-1 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-full animate-in zoom-in-95 duration-300">
                              <X className="size-3.5 text-red-600 dark:text-red-400" />
                              {/* <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-tight">
                                Pending
                              </span> */}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isAnyComplete && (
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[11px] font-bold uppercase tracking-tight gap-1.5 border-emerald-200 hover:bg-emerald-50"
                                onClick={() =>
                                  setPreviewDoc(doc.id === 'aadhaar' ? aadhaarDocs : uploadedDoc!)
                                }
                              >
                                <Eye className="size-3.5" />
                                {/* View Files */}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                disabled={isDeleting}
                                onClick={async () => {
                                  if (doc.id === 'aadhaar') {
                                    const heads = documents.filter(
                                      (d) =>
                                        d.type === DocumentType.AadharFront ||
                                        d.type === DocumentType.AadharBack,
                                    );
                                    for (const d of heads) {
                                      if (d.id) await deleteDocument(leadId, d.id);
                                    }
                                    queryClient.invalidateQueries({
                                      queryKey: ['lead-documents', leadId],
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['leads', leadId] });
                                    toast.success('Aadhaar documents deleted');
                                  } else if (uploadedDoc?.id) {
                                    deleteDoc(uploadedDoc.id);
                                  }
                                }}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          )}
                          {doc.required && !isAnyComplete && (
                            <span className="text-[10px] font-bold text-destructive uppercase tracking-widest bg-destructive/5 px-2 py-0.5 rounded border border-destructive/10">
                              Required
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {isAnyComplete && (
                          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            {doc.id === 'aadhaar' ? (
                              <div className="grid grid-cols-2 gap-4">
                                {aadhaarDocs.map((aDoc, idx) => (
                                  <div key={aDoc.id || idx} className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground text-center tracking-wider">
                                      {idx === 0 ? 'Aadhaar Front' : 'Aadhaar Back'}
                                    </p>
                                    <div className="w-fit mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm ring-1 ring-slate-950/5">
                                      {aDoc.fileUrl ? (
                                        <Image
                                          src={aDoc.fileUrl}
                                          alt={aDoc.name}
                                          width={600}
                                          height={800}
                                          className="w-auto h-[180px] object-contain transition-transform hover:scale-105 duration-500"
                                        />
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
                                <div className="w-fit mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm ring-1 ring-slate-950/5">
                                  {uploadedDoc?.fileUrl ? (
                                    <Image
                                      src={uploadedDoc.fileUrl}
                                      alt={uploadedDoc.name}
                                      width={600}
                                      height={800}
                                      className="w-auto h-[250px] object-contain transition-transform hover:scale-105 duration-500"
                                    />
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

                        {!isAnyComplete && (
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 p-0 list-none">
                            {doc.instructions.map((i) => (
                              <li
                                key={i}
                                className="text-[13px] text-muted-foreground flex items-center gap-2"
                              >
                                <div className="size-1 bg-primary/40 rounded-full" />
                                {i}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {!isAnyComplete &&
                        (doc.id === 'aadhaar' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 scale-in-center">
                            {[
                              {
                                side: 'aadhaar_front',
                                label: 'Front Side',
                                data: aadhaarDocs.find((d) => d.type === DocumentType.AadharFront),
                                dragging: draggedDocType === 'aadhaar_front',
                              },
                              {
                                side: 'aadhaar_back',
                                label: 'Back Side',
                                data: aadhaarDocs.find((d) => d.type === DocumentType.AadharBack),
                                dragging: draggedDocType === 'aadhaar_back',
                              },
                            ].map((item) => {
                              const isMissing = showErrors && !item.data;
                              return (
                                <div key={item.side} className="space-y-2">
                                  <button
                                    type="button"
                                    onClick={() => !item.data && handleFileUploadTrigger(item.side)}
                                    className={cn(
                                      'relative group overflow-hidden rounded-lg border-2 transition-all duration-200 text-left w-full min-h-[160px] flex flex-col items-center justify-center p-6',
                                      item.data
                                        ? 'border-emerald-100 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/10'
                                        : item.dragging
                                          ? 'border-primary border-dashed bg-muted'
                                          : isMissing
                                            ? 'border-destructive/50 border-dashed bg-destructive/5 hover:bg-destructive/10'
                                            : 'border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-muted/30',
                                    )}
                                    onDragOver={(e) => !item.data && handleDragOver(e, item.side)}
                                    onDragLeave={(e) => !item.data && handleDragLeave(e)}
                                    onDrop={(e) => !item.data && handleDrop(e, item.side)}
                                  >
                                    <div
                                      className={cn(
                                        'size-9 rounded-lg flex items-center justify-center mb-2 transition-colors',
                                        item.data
                                          ? 'bg-emerald-100 text-emerald-600'
                                          : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
                                      )}
                                    >
                                      {item.data ? (
                                        <CheckCircle2 className="size-4.5" />
                                      ) : (
                                        <Upload className="size-4.5" />
                                      )}
                                    </div>
                                    <h4 className="text-sm font-semibold text-foreground">
                                      {item.label}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground mt-1 text-center">
                                      {item.data ? 'Ready' : 'Click to Upload'}
                                    </p>
                                  </button>
                                  {isMissing && (
                                    <p className="text-[10px] font-bold text-destructive tracking-widest flex items-center gap-1 ml-1">
                                      <AlertCircle className="size-3" />
                                      <span>Missing {item.label}</span>
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="scale-in-center">
                            <button
                              type="button"
                              className={cn(
                                'relative group overflow-hidden rounded-lg border-2 transition-all duration-200 text-left w-full min-h-[160px] flex flex-col items-center justify-center p-8',
                                draggedDocType === doc.id
                                  ? 'border-primary border-dashed bg-muted'
                                  : showErrors && !uploadedDoc
                                    ? 'border-destructive/50 border-dashed bg-destructive/5'
                                    : 'border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-muted/30',
                              )}
                              onDragOver={(e) => handleDragOver(e, doc.id)}
                              onDragLeave={(e) => handleDragLeave(e)}
                              onDrop={(e) => handleDrop(e, doc.id)}
                              onClick={() => handleFileUploadTrigger(doc.id)}
                            >
                              <div className="size-12 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center mb-4 transition-colors group-hover:bg-red-100 dark:group-hover:bg-red-900 text-red-600 dark:text-red-400">
                                <Upload className="size-6" />
                              </div>
                              <h4 className="text-base font-semibold text-foreground">
                                Click or Drag File
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1 text-center max-w-[200px]">
                                Securely upload your document here
                              </p>
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prevStep}
          disabled={currentStep === 0 || submitFinalMutation.isPending}
          className="h-11 rounded-lg px-8 font-bold tracking-wider text-[11px] uppercase"
        >
          <ChevronLeft className="size-4 mr-1.5" />
          Previous
        </Button>

        <Button
          size="sm"
          onClick={nextStep}
          disabled={uploadMutation.isPending || submitFinalMutation.isPending}
          className={cn(
            'h-11 rounded-lg px-10 font-bold tracking-wider text-[11px] transition-all uppercase',
            isStepComplete(activeGroup.id)
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
              : 'bg-muted text-muted-foreground grayscale cursor-not-allowed',
          )}
        >
          {submitFinalMutation.isPending
            ? 'Finalizing...'
            : currentStep === DOCUMENT_GROUPS.length - 1
              ? 'Finish Submission'
              : 'Continue'}
          {!submitFinalMutation.isPending && <ChevronRight className="size-4 ml-1.5" />}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2 text-center pb-8 pt-4">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold tracking-[0.15em] opacity-40 uppercase">
          <Lock className="size-3" />
          <p>End-to-End Encryption Enabled</p>
        </div>
        <p className="text-[9px] text-muted-foreground/30 tracking-[0.2em] font-medium uppercase">
          © {new Date().getFullYear()} Samatva CRM Platform
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,.pdf"
      />

      {/* Confirmation Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-[400px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm tracking-tight">Confirm Filename</DialogTitle>
            <DialogDescription className="text-xs font-medium">
              Provide a clear title for internal verification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="docName"
                className={cn(
                  'text-[10px] font-bold',
                  fieldErrors.name ? 'text-destructive' : 'text-muted-foreground',
                )}
              >
                Document Title
              </Label>
              <Input
                id="docName"
                value={uploadFileName}
                onChange={(e) => {
                  setUploadFileName(e.target.value);
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                }}
                className={cn(
                  'h-11 text-sm focus-visible:ring-primary rounded-lg font-medium',
                  fieldErrors.name && 'border-destructive focus-visible:ring-destructive',
                )}
              />
              {fieldErrors.name && (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="size-3" />
                  {fieldErrors.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              // className="text-[10px] font-bold  tracking-widest"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmUpload}
              disabled={uploadMutation.isPending}
              size="sm"
              // className="px-8 h-10  font-bold  tracking-widest rounded-lg"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
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
              <div className="grid grid-cols-2 gap-6 items-start h-full">
                {previewDoc.map((doc, idx) => (
                  <div key={doc.id || idx} className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {idx === 0 ? 'Front View' : 'Back View'}
                    </p>
                    <div className="w-fit mx-auto bg-white rounded-lg shadow-xl border overflow-hidden">
                      <Image
                        src={doc.fileUrl || ''}
                        alt={`Preview ${idx + 1}`}
                        className="w-auto h-[300px] object-contain"
                        width={400}
                        height={300}
                      />
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
                  <div className="w-fit mx-auto bg-white rounded-lg shadow-2xl border overflow-hidden">
                    <Image
                      src={previewDoc.fileUrl}
                      alt="Document Preview"
                      className="w-auto h-[500px] object-contain"
                      width={800}
                      height={600}
                    />
                  </div>
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
