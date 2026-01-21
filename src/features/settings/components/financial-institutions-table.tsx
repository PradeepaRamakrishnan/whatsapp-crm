'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Edit, Eye, MoreHorizontal, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllFinancialInstitutions } from '../services';
import type { FinancialInstitution, FinancialInstitutionsResponse } from '../types';
import { EditFinancialInstitutionSheet } from './edit-financial-institution-sheet';
import { FinancialInstitutionDetailSheet } from './financial-institution-detail-sheet';

const getStatusStyles = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-transparent';
    case 'inactive':
      return 'bg-slate-100 text-slate-700 hover:bg-slate-100/80 border-transparent';
    default:
      return 'bg-slate-100 text-slate-700 hover:bg-slate-100/80 border-transparent';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export function FinancialInstitutionsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedInstitution, setSelectedInstitution] = React.useState<FinancialInstitution | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';

  const { data, isLoading, isError } = useQuery<FinancialInstitutionsResponse>({
    queryKey: ['financial-institutions', page, pageSize, search],
    queryFn: () => getAllFinancialInstitutions(page, pageSize),
  });

  const updateParams = React.useCallback(
    (updates: { page?: number; limit?: number; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) params.set('page', String(updates.page));
      if (updates.limit !== undefined) params.set('limit', String(updates.limit));
      if (updates.search !== undefined) {
        if (updates.search) params.set('search', updates.search);
        else params.delete('search');
        params.set('page', '1'); // Reset to page 1 on search
      }
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleRowClick = (institution: FinancialInstitution) => {
    setSelectedInstitution(institution);
    setIsSheetOpen(true);
  };

  const handleEditClick = (institution: FinancialInstitution) => {
    setSelectedInstitution(institution);
    setIsEditSheetOpen(true);
  };

  const meta = data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };
  const institutions = data?.data || [];

  // Calculate start and end indices for display
  const startIndex = (meta.page - 1) * meta.limit + 1;
  const endIndex = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search institutions..."
            value={search}
            onChange={(e) => updateParams({ search: e.target.value })}
            className="pl-9 h-10 border-slate-200 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-slate-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow mt-2 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100/50 hover:bg-slate-50/50">
              <TableHead className="w-[300px] font-semibold text-slate-900">
                Institution Name
              </TableHead>
              <TableHead className="font-semibold text-slate-900">IFSC Code</TableHead>
              <TableHead className="font-semibold text-slate-900">Branch</TableHead>
              <TableHead className="font-semibold text-slate-900">Contact Person</TableHead>
              <TableHead className="font-semibold text-slate-900">Email</TableHead>
              <TableHead className="font-semibold text-slate-900">Phone</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="font-semibold text-slate-900">Uploaded At</TableHead>
              <TableHead className="w-[100px] font-semibold text-slate-900 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-red-500">
                  Failed to load data
                </TableCell>
              </TableRow>
            ) : institutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-slate-500">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              institutions.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-slate-50 border-slate-100 cursor-pointer group"
                  onClick={() => handleRowClick(item)}
                >
                  <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                  <TableCell className="text-slate-600">{item.ifscCode}</TableCell>
                  <TableCell className="text-slate-600">{item.branch}</TableCell>
                  <TableCell className="text-slate-600">{item.contact.name}</TableCell>
                  <TableCell className="text-slate-600">{item.contact.email}</TableCell>
                  <TableCell className="text-slate-600">{item.contact.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`rounded-full px-3 py-0.5 font-medium ${getStatusStyles(item.status)}`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => handleRowClick(item)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="text-sm text-slate-500 font-medium order-2 sm:order-1">
          Showing {meta.total > 0 ? startIndex : 0} to {endIndex} of {meta.total}{' '}
          <span className="ml-2 inline-flex items-center gap-2">
            Rows Per Page:
            <Select
              value={String(meta.limit)}
              onValueChange={(val) => updateParams({ limit: Number(val), page: 1 })}
            >
              <SelectTrigger className="h-8 w-[70px] border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </span>
        </div>

        <div className="flex items-center gap-1 order-1 sm:order-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-slate-200"
            onClick={() => updateParams({ page: Math.max(meta.page - 1, 1) })}
            disabled={meta.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <Button
            className="h-9 w-9 bg-orange-500 hover:bg-orange-600 text-white font-medium"
            onClick={() => {}} // Current page button usually just shows the number
          >
            {meta.page}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-slate-200"
            onClick={() => updateParams({ page: Math.min(meta.page + 1, meta.totalPages) })}
            disabled={meta.page >= meta.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>

      {/* Detail Sheet */}
      <FinancialInstitutionDetailSheet
        institution={selectedInstitution}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* Edit Sheet */}
      <EditFinancialInstitutionSheet
        institution={selectedInstitution}
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
      />
    </div>
  );
}
