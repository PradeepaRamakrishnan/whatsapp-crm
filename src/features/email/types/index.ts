export type EmailProviderType = 'sendgrid' | 'mailgun' | 'resend';

export interface EmailAccount {
  id: string;
  provider: EmailProviderType;
  name: string;
  fromEmail: string;
  fromName?: string;
  domain?: string;
  isActive: boolean;
  status: string;
  apiKeyMasked: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailConversation {
  contactEmail: string;
  lastSubject: string;
  lastMessage: string;
  count: number;
  lastAt: string;
}

export interface EmailMessage {
  id: string;
  to: string;
  from: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  direction: 'inbound' | 'outbound';
  status: string;
  createdAt: string;
}

export interface ConnectProviderPayload {
  provider: EmailProviderType;
  name?: string;
  fromEmail: string;
  fromName?: string;
  apiKey: string;
  domain?: string;
  mailgunRegion?: string;
  // Optional IMAP — enables inbound sync for any provider
  imapHost?: string;
  imapPort?: number;
  imapUser?: string;
  imapPass?: string;
}

export interface SendEmailPayload {
  accountId: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}
