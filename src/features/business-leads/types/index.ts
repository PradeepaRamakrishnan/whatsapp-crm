export interface SearchResult {
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  mapsUrl: string;
  rating: number;
  score: number;
  type: string;
  area: string;
  city: string;
  location: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface SearchParams {
  type: string;
  area: string;
  city: string;
  location?: string;
  country?: string;
}

export interface BusinessLead {
  id: string;
  type: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  area: string;
  city: string;
  location?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessLeadsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BusinessLeadsResponse {
  data: BusinessLead[];
  meta: BusinessLeadsMeta;
}

export interface CreateBusinessLeadPayload {
  type: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  area: string;
  city: string;
  location?: string;
  notes?: string;
}

export interface BulkCreatePayload {
  leads: CreateBusinessLeadPayload[];
}

export interface GetBusinessLeadsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  city?: string;
}
