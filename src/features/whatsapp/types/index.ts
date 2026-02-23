// src/features/whatsapp/types/index.ts

export interface PhoneNumber {
  id: string;
  displayPhoneNumber: string;
  verifiedName: string;
  codeVerificationStatus: 'VERIFIED' | 'NOT_VERIFIED';
}

export interface WhatsappAccount {
  id: string;
  wabaId: string;
  wabaName: string;
  phoneNumber: string;
  phoneNumberId: string;
  status: 'connected' | 'active' | 'disconnected' | 'error' | 'pending_otp';
  tokenType: 'short_lived' | 'long_lived' | 'system_user';
  tokenExpiry?: string;
  isVerified: boolean;
  createdAt: string;
}

export type ConnectStep = 'idle' | 'connecting' | 'select_phone' | 'registering' | 'done' | 'error';

export interface ManagedPhone {
  id: string;
  phoneNumber: string;
  phoneNumberId: string;
  verifiedName?: string;
  qualityRating?: string;
  status?: string;
  isDefault: boolean;
}

export interface UserLink {
  id?: string;
  phoneNumber: string;
  status?: string;
  linkedAt?: string;
}

// ─── Inbox / Conversations ─────────────────────────────────────────────────────

export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'template'
  | 'interactive'
  | 'sticker'
  | 'location';
export type ConversationStatus = 'open' | 'resolved' | 'pending';

export interface Message {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  type: MessageType;
  status: MessageStatus;
  body?: string;
  mediaUrl?: string;
  mediaCaption?: string;
  mediaFilename?: string;
  templateName?: string;
  templateParams?: string[];
  timestamp: string;
  agentId?: string;
  agentName?: string;
  wamid?: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactAvatarUrl?: string;
  accountId: string;
  phoneNumberId: string;
  status: ConversationStatus;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageDirection?: MessageDirection;
  unreadCount: number;
  assignedAgentId?: string;
  assignedAgentName?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse {
  data: Conversation[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface MessagesResponse {
  data: Message[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface SendTextPayload {
  accountId: string;
  to: string;
  body: string;
}

export interface SendMediaPayload {
  accountId: string;
  to: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

export interface SendInteractivePayload {
  accountId: string;
  to: string;
  interactive: Record<string, unknown>;
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export type ContactStatus = 'active' | 'blocked' | 'opted_out';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags?: string[];
  notes?: string;
  status: ContactStatus;
  optedIn: boolean;
  optedInAt?: string;
  lastContactedAt?: string;
  assignedAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  data: Contact[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateContactPayload {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags?: string[];
  notes?: string;
  assignedAccountId?: string;
}

export interface UpdateContactPayload extends Partial<CreateContactPayload> {
  status?: ContactStatus;
  optedIn?: boolean;
}

export interface ImportContactsPayload {
  contacts: Array<{ name: string; phone: string; email?: string; company?: string }>;
  accountId: string;
}

export interface ImportContactsResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; phone: string; reason: string }>;
}

// ─── Bulk Messaging ────────────────────────────────────────────────────────────

export type BulkCampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed';

export interface BulkCampaignContact {
  id: string;
  campaignId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'opted_out';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
}

export interface BulkCampaign {
  id: string;
  name: string;
  accountId: string;
  phoneNumberId: string;
  templateName: string;
  templateLanguage: string;
  templateParams?: Record<string, string>[];
  status: BulkCampaignStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BulkCampaignsResponse {
  data: BulkCampaign[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateBulkCampaignPayload {
  name: string;
  accountId: string;
  phoneNumberId: string;
  templateName: string;
  templateLanguage: string;
  contactIds?: string[];
  scheduledAt?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'custom';

export interface DailyStats {
  date: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  inbound: number;
}

export interface Analytics {
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  totalInbound: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  daily: DailyStats[];
  topTemplates: Array<{ templateName: string; sent: number; readRate: number }>;
  activeConversations: number;
  resolvedConversations: number;
  avgResponseTimeMinutes: number;
}

export interface MessageStats {
  accountId: string;
  period: AnalyticsPeriod;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  inbound: number;
}

// ─── Webhook & API Keys (Settings) ────────────────────────────────────────────

export type WebhookEventType =
  | 'message.received'
  | 'message.sent'
  | 'message.delivered'
  | 'message.read'
  | 'message.failed'
  | 'conversation.opened'
  | 'conversation.resolved'
  | 'contact.created'
  | 'bulk.completed';

export interface WebhookConfig {
  id?: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WebhookLog {
  id: string;
  event: WebhookEventType;
  url: string;
  statusCode?: number;
  success: boolean;
  requestBody: string;
  responseBody?: string;
  durationMs?: number;
  createdAt: string;
}

export interface WebhookLogsResponse {
  data: WebhookLog[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  scopes: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  revokedAt?: string;
}

export interface CreateApiKeyResult {
  apiKey: ApiKey;
  fullKey: string;
}

// ─── Sandbox ──────────────────────────────────────────────────────────────────

export interface SandboxMessage {
  id: string;
  direction: MessageDirection;
  type: MessageType;
  body?: string;
  mediaUrl?: string;
  templateName?: string;
  timestamp: string;
  status: MessageStatus;
}

export interface SendSandboxMessagePayload {
  accountId: string;
  type: MessageType;
  body?: string;
  mediaUrl?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParams?: string[];
}

export interface SimulateIncomingPayload {
  accountId: string;
  from: string;
  body: string;
}
