export type TemplateStatus = 'approved' | 'pending' | 'rejected' | 'draft';

export type TemplateChannel = 'email' | 'sms' | 'whatsapp';

export type TemplateBankTag = 'ICICI' | 'HDFC' | 'Axis' | 'IndusInd' | 'All Banks';

export type TemplateType = 'Bank-specific' | 'General' | 'Follow-up' | 'Reminder' | 'Settlement';

export interface TemplateContent {
  subject?: string;
  body: string;
}

export interface TemplateData {
  id: string;
  name: string;
  description: string;
  channel: TemplateChannel;
  status: TemplateStatus;
  bankTag?: TemplateBankTag;
  typeTag: TemplateType;
  content: string | TemplateContent; // Can be either string or object
  createdAt: string;
  modifiedBy: string;
  tags?: string[];
}
