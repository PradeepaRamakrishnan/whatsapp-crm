export interface FinancialInstitution {
  id: string;
  name: string;
  ifscCode: string;
  branch: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  status: string;
  createdAt: string;
}

export interface FinancialInstitutionsResponse {
  data: FinancialInstitution[];
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TemplateVariable {
  id: string;
  key: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  fallbackValue: string | null;
}

export interface Template {
  id: string;
  externalId: string;
  name: string;
  alias: string;
  status: string;
  publishedAt: string;
  from: string;
  subject: string;
  replyTo: string;
  html?: string;
  text?: string;
  variables: TemplateVariable[];
  active: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesResponse {
  data: Template[];
}

export interface WhatsAppButton {
  text: string;
  type: 'QUICK_REPLY' | 'URL';
  url?: string;
  example?: string[];
}

export interface WhatsAppComponent {
  text?: string;
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  buttons?: WhatsAppButton[];
  example?: {
    // biome-ignore lint/style/useNamingConvention: API returns snake_case
    header_handle?: string[];
    // biome-ignore lint/style/useNamingConvention: API returns snake_case
    body_text?: string[][];
  };
}

export interface WhatsAppTemplate {
  id: string;
  externalId: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components: WhatsAppComponent[];
  active: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppTemplatesResponse {
  data: WhatsAppTemplate[];
}
