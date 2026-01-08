export type TemplateStatus = 'approved' | 'pending' | 'rejected' | 'draft';

export type TemplateChannel = 'email' | 'sms' | 'whatsapp';

export type TemplateBankTag = 'ICICI' | 'HDFC' | 'Axis' | 'IndusInd' | 'All Banks';

export type TemplateType = 'Bank-specific' | 'General' | 'Follow-up' | 'Reminder' | 'Settlement';

export interface TemplateData {
  id: string;
  title: string;
  channel: TemplateChannel;
  status: TemplateStatus;
  bankTag?: TemplateBankTag;
  typeTag: TemplateType;
  content: string;
  modifiedDate: string;
  modifiedBy: string;
}
