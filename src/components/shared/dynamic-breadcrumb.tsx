'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { FileDetailData } from '@/features/files/types/file.types';

const SECTION_LABELS: Record<string, string> = {
  recipients: 'Recipients',
  campaigns: 'Campaigns',
  leads: 'Leads',
  settings: 'Settings',
  dashboard: 'Dashboard',
  overview: 'Overview',
  'business-leads': 'Business Leads',
  email: 'Email',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  phone: 'Phone',
};

const SUB_LABELS: Record<string, string> = {
  list: 'List',
  pending: 'Pending',
  upload: 'Upload',
  create: 'Create',
  logs: 'Logs',
  configuration: 'Configuration',
  'manual-followup': 'Manual Follow-up',
  search: 'Search',
  accounts: 'Accounts',
  inbox: 'Inbox',
  'campaign-templates': 'Campaign Templates',
  'financial-institutions': 'Financial Institutions',
  nbfc: 'NBFC',
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const section = segments[0];
  const sectionLabel = SECTION_LABELS[section] ?? section;

  // Single-segment route (e.g. /dashboard, /overview, /phone)
  if (segments.length === 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const sub = segments[1];

  // /files/list, /files/pending, /files/upload
  if (section === 'recipients' && SUB_LABELS[sub]) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{SUB_LABELS[sub]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // /files/[id] — try to get file name from query cache
  if (section === 'recipients') {
    const fileId = sub;
    const fileData = queryClient.getQueryData<FileDetailData>(['file', fileId]);
    const fileName = fileData?.name;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/recipients/list">{sectionLabel}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{fileName ?? 'File Details'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // /campaigns/[id], /leads/[id] — dynamic detail pages
  const knownSubs = [
    'list',
    'create',
    'logs',
    'configuration',
    'manual-followup',
    'search',
    'accounts',
    'inbox',
  ];
  if (!knownSubs.includes(sub)) {
    // It's a detail page
    const listPath = `/${section}/list`;
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={listPath}>{sectionLabel}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // /settings/campaign-templates, /campaigns/create, etc.
  const subLabel =
    SUB_LABELS[sub] ?? sub.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{subLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
