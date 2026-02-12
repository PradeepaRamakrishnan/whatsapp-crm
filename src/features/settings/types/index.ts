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
  variables: TemplateVariable[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesResponse {
  data: Template[];
}
