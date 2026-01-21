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
