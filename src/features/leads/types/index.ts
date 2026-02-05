import { z } from 'zod';

export enum DocumentType {
  Aadhar = 'aadhaar',
  AadharFront = 'aadhaar_front',
  AadharBack = 'aadhaar_back',
  Pan = 'pan',
  IncomeProof = 'income_proof',
  AddressProof = 'address_proof',
  BankStatement = 'bank_statement',
  LoanStatement = 'loan_statement',
  Other = 'other',
}

export enum VerificationStatus {
  Pending = 'pending',
  Verified = 'verified',
  Rejected = 'rejected',
}

// Zod schema based on backend fields
export const DocumentSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  type: z.nativeEnum(DocumentType),
  name: z.string().min(3, 'Name must be at least 3 characters').max(100).optional(),
  collected: z.boolean().default(false),
  collectedAt: z.date().optional().nullable(),
  fileUrl: z.string().url('Invalid file URL').optional().nullable(),
  verificationStatus: z.nativeEnum(VerificationStatus).default(VerificationStatus.Pending),
  verifiedBy: z.string().optional().nullable(),
  verifiedAt: z.date().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
  active: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema for the upload form specifically
export const DocumentUploadSchema = z.object({
  name: z.string().min(3, 'Document title is required (min 3 chars)').max(100),
  file: z
    .instanceof(File, { message: 'Please select a valid file' })
    .refine((file) => file.size <= 15 * 1024 * 1024, 'File size must be less than 15MB')
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type),
      'Only PDF, JPG, and PNG are allowed',
    ),
  type: z.nativeEnum(DocumentType),
});

export type DocumentInput = z.infer<typeof DocumentSchema>;
export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>;

export interface Document {
  id: string;
  name: string;
  type: string;
  fileUrl: string | null;
  collected: boolean;
  collectedAt: string | null;
  verificationStatus: VerificationStatus;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  customerName: string;
  status: string;
  campaign: {
    id: string;
    name: string;
    status: string;
    fileName?: string;
    bankName?: string;
  };
  contact: {
    id: string;
    status: string;
    email?: {
      sent: boolean;
      sentAt?: string;
      deliveredAt?: string;
      bouncedAt?: string;
    };
    sms?: {
      sent: boolean;
      sentAt?: string;
    };
    whatsapp?: {
      sent: boolean;
      sentAt?: string;
    };
  };
  fileContent: {
    id: string;
    customerName: string;
    emailId: string;
    mobileNumber: string;
    settlementAmount?: number;
    settlementCount?: number;
  };
  email?: {
    sent: boolean;
    sentAt?: string;
  };
  sms?: {
    sent: boolean;
    sentAt?: string;
  };
  whatsapp?: {
    sent: boolean;
    sentAt?: string;
  };
  interestedAt: string;
  from?: string;
  dob?: string;
  panNumber?: string;
  consentGivenAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
}

export interface LeadsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadsResponse {
  data: Lead[];
  meta: LeadsMeta;
  stats: {
    totalInterested: number;
    newToday: number;
    avgResponseTime: string;
    followUpsDue: number;
  };
}
