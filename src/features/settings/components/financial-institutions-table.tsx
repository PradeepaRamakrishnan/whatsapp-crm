'use client';

import { useQuery } from '@tanstack/react-query';
import { Edit, Eye, MoreHorizontal } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import * as React from 'react';
// import { Badge } from '@/components/ui/badge';
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
  SelectGroup,
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

// const getStatusStyles = (status: string): string => {
//   switch (status?.toLowerCase()) {
//     case 'active':
//       return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
//     case 'inactive':
//       return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
//     default:
//       return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
//   }
// };

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
        <div className="flex-1">
          <Input
            placeholder="Filter institutions..."
            value={search}
            onChange={(e) => updateParams({ search: e.target.value })}
            className="max-w-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="rowsPerPage" className="text-sm text-muted-foreground">
            Rows per page
          </label>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              const v = Number(val) || 10;
              updateParams({ limit: v, page: 1 });
            }}
          >
            <SelectTrigger size="sm" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table className="[&_th]:px-6 [&_th]:py-3 [&_td]:px-6 [&_td]:py-2 [&_th]:font-normal [&_th]:bg-muted [&_td]:font-medium">
          <TableHeader>
            <TableRow>
              <TableHead>Institution Name</TableHead>
              <TableHead>IFSC Code</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Contact Person</TableHead>
              {/* <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead> */}
              <TableHead>Uploaded At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
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
                <TableCell colSpan={9} className="h-24 text-center">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              institutions.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(item)}
                >
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.ifscCode}</TableCell>
                  <TableCell className="text-muted-foreground">{item.branch}</TableCell>
                  <TableCell className="text-muted-foreground">{item.contact.name}</TableCell>
                  {/* <TableCell className="text-muted-foreground">{item.contact.email}</TableCell>
                  <TableCell className="text-muted-foreground">{item.contact.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-medium ${getStatusStyles(item.status)}`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell> */}
                  <TableCell className="text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
      <div className="flex items-center justify-end space-x-2 p-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Showing {meta.total > 0 ? startIndex : 0} to {endIndex} of {meta.total} results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: Math.max(meta.page - 1, 1) })}
            disabled={meta.page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {meta.page} of {meta.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: Math.min(meta.page + 1, meta.totalPages) })}
            disabled={meta.page >= meta.totalPages || meta.totalPages === 0}
          >
            Next
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
