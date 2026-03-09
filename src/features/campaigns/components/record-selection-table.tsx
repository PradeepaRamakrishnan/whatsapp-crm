'use client';

import {
  AlertCircle,
  CheckCircle2,
  Filter,
  Loader2,
  MinusCircle,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FileRecord, FileStats } from '@/features/files/types/file.types';

type RecordSelectionTableProps = {
  records: FileRecord[];
  stats: FileStats;
  isLoading?: boolean;
};

export function RecordSelectionTable({ records, stats, isLoading }: RecordSelectionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [amountFilter, setAmountFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tempAmountFilter, setTempAmountFilter] = useState('all');
  const [tempStatusFilter, setTempStatusFilter] = useState('all');

  const handleEditSelection = () => {
    setTempAmountFilter(amountFilter);
    setTempStatusFilter(statusFilter);
    setIsEditDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setAmountFilter(tempAmountFilter);
    setStatusFilter(tempStatusFilter);
    setIsEditDialogOpen(false);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (searchQuery && !r.customerName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (amountFilter !== 'all') {
        if (amountFilter.endsWith('+')) {
          if (r.settlementAmount < Number(amountFilter.replace('+', ''))) return false;
        } else {
          const [minStr, maxStr] = amountFilter.split('-');
          const min = Number(minStr);
          const max = Number(maxStr);
          if (r.settlementAmount < min || r.settlementAmount > max) return false;
        }
      }
      if (statusFilter === 'valid' && (!r.isValid || r.isExcluded)) return false;
      if (statusFilter === 'invalid' && r.isValid) return false;
      if (statusFilter === 'excluded' && !r.isExcluded) return false;
      return true;
    });
  }, [records, searchQuery, amountFilter, statusFilter]);

  const validCount = records.filter((r) => r.isValid && !r.isExcluded).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-[12px]">Loading records…</span>
      </div>
    );
  }

  const hasActiveFilters =
    amountFilter !== 'all' || statusFilter !== 'all' || searchQuery.length > 0;

  return (
    <>
      <div className="space-y-3">
        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
              <Users className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground/60">Total</p>
              <p className="text-[14px] font-bold leading-tight text-foreground">
                {stats.totalRecords.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200/60 bg-emerald-50/50 px-3 py-2.5 dark:border-emerald-800/40 dark:bg-emerald-950/20">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/60">
                Valid
              </p>
              <p className="text-[14px] font-bold leading-tight text-emerald-700 dark:text-emerald-400">
                {validCount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-red-200/60 bg-red-50/50 px-3 py-2.5 dark:border-red-800/40 dark:bg-red-950/20">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-500/10">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-red-600/70 dark:text-red-400/60">
                Invalid
              </p>
              <p className="text-[14px] font-bold leading-tight text-red-600 dark:text-red-400">
                {stats.totalInvalidRecords.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-amber-200/60 bg-amber-50/50 px-3 py-2.5 dark:border-amber-800/40 dark:bg-amber-950/20">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
              <MinusCircle className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-amber-600/70 dark:text-amber-400/60">
                Excluded
              </p>
              <p className="text-[14px] font-bold leading-tight text-amber-600 dark:text-amber-400">
                {stats.excludedCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ── Filter toolbar ── */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              placeholder="Search by name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`h-8 gap-1.5 px-3 text-xs ${hasActiveFilters ? 'border-primary/40 bg-primary/5 text-primary' : ''}`}
            onClick={handleEditSelection}
          >
            <Filter className="h-3 w-3" />
            Filters
            {hasActiveFilters && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                !
              </span>
            )}
          </Button>
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-lg border border-border/50">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <AlertCircle className="h-7 w-7 text-muted-foreground/25" />
              <p className="text-[12px] text-muted-foreground/60">
                No records match the current filters
              </p>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 text-[11px]"
                  onClick={() => {
                    setSearchQuery('');
                    setAmountFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <ScrollArea className="h-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/40">
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Customer
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Phone
                      </th>
                      <th className="hidden px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 sm:table-cell">
                        Email
                      </th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Amount
                      </th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.slice(0, 100).map((record, i) => (
                      <tr
                        key={record.id}
                        className={`border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20 ${
                          i % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                        }`}
                      >
                        <td className="px-3 py-2 text-[12px] font-medium">{record.customerName}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {record.mobileNumber}
                        </td>
                        <td className="hidden px-3 py-2 text-[11px] text-muted-foreground sm:table-cell">
                          {record.emailId || <span className="text-muted-foreground/30">—</span>}
                        </td>
                        <td className="px-3 py-2 text-right text-[12px] font-semibold">
                          ₹{record.settlementAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {record.isExcluded ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              <MinusCircle className="h-2.5 w-2.5" />
                              Excluded
                            </span>
                          ) : record.isValid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                              <XCircle className="h-2.5 w-2.5" />
                              Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>

              <div className="border-t border-border/40 bg-muted/20 px-3 py-2 text-center text-[10.5px] text-muted-foreground/60">
                Showing {Math.min(100, filteredRecords.length).toLocaleString()} of{' '}
                {filteredRecords.length.toLocaleString()} matching
                {filteredRecords.length !== stats.totalRecords &&
                  ` · ${stats.totalRecords.toLocaleString()} total`}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Filter Modal ── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Filter Records</DialogTitle>
            <DialogDescription className="text-[12px]">
              Narrow down which records are included in this campaign
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="amount-filter" className="text-[12px] font-semibold">
                Settlement Amount
              </Label>
              <Select value={tempAmountFilter} onValueChange={setTempAmountFilter}>
                <SelectTrigger id="amount-filter" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="0-25000">Below ₹25,000</SelectItem>
                  <SelectItem value="25000-50000">₹25,000 – ₹50,000</SelectItem>
                  <SelectItem value="50000-100000">₹50,000 – ₹1,00,000</SelectItem>
                  <SelectItem value="100000+">Above ₹1,00,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status-filter" className="text-[12px] font-semibold">
                Record Status
              </Label>
              <Select value={tempStatusFilter} onValueChange={setTempStatusFilter}>
                <SelectTrigger id="status-filter" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="valid">Valid only</SelectItem>
                  <SelectItem value="invalid">Invalid only</SelectItem>
                  <SelectItem value="excluded">Excluded only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setTempAmountFilter('all');
                setTempStatusFilter('all');
              }}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" className="text-xs" onClick={handleApplyFilters}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
