'use client';

import { Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

// Mock data for preview
const mockRecords = Array.from({ length: 2500 }, (_, i) => ({
  id: i + 1,
  customerName: `Customer ${i + 1}`,
  phone: `98${String(i).padStart(8, '0')}`,
  email: `customer${i + 1}@example.com`,
  outstandingAmount: Math.floor(Math.random() * 30000) + 15000,
  bank: ['ICICI', 'HDFC', 'SBI'][Math.floor(Math.random() * 3)],
  settlements: Math.floor(Math.random() * 3),
}));

type RecordSelectionTableProps = {
  totalRecords?: number;
  selectedRecords?: number;
};

export function RecordSelectionTable({
  totalRecords = 2500,
  selectedRecords = 2500,
}: RecordSelectionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bankFilter, setBankFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [settlementFilter, setSettlementFilter] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tempAmountFilter, setTempAmountFilter] = useState('all');
  const [tempSettlementFilter, setTempSettlementFilter] = useState('all');

  const handleEditSelection = () => {
    setTempAmountFilter(amountFilter);
    setTempSettlementFilter(settlementFilter);
    setIsEditDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setAmountFilter(tempAmountFilter);
    setSettlementFilter(tempSettlementFilter);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Summary Card */}
        <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-blue-100/50 dark:border-blue-800 dark:from-blue-950/30 dark:to-blue-900/20">
          <div className="flex items-start justify-between gap-4 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500 p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                  Selected Records Summary
                </h3>
                <p className="mb-3 text-2xl font-bold text-foreground">
                  {selectedRecords.toLocaleString()} records selected for this campaign
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span>Total customers: {totalRecords.toLocaleString()}</span>
                  <span>Amount range: ₹15,000 - ₹45,000</span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={handleEditSelection}
            >
              Edit Selection
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
          <Select value={bankFilter} onValueChange={setBankFilter}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Banks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Banks</SelectItem>
              <SelectItem value="icici">ICICI</SelectItem>
              <SelectItem value="hdfc">HDFC</SelectItem>
              <SelectItem value="sbi">SBI</SelectItem>
            </SelectContent>
          </Select>
          <Select value={amountFilter} onValueChange={setAmountFilter}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Amounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Amounts</SelectItem>
              <SelectItem value="25000-50000">₹25,000 - ₹50,000</SelectItem>
              <SelectItem value="50000-75000">₹50,000 - ₹75,000</SelectItem>
              <SelectItem value="75000-100000">₹75,000 - ₹1,00,000</SelectItem>
              <SelectItem value="100000+">₹1,00,000+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={settlementFilter} onValueChange={setSettlementFilter}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="2">2 Settlements</SelectItem>
              <SelectItem value="3+">3+ Settlements</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table Preview */}
        <Card>
          <div className="p-4">
            <h4 className="mb-4 font-semibold">Records Preview</h4>
            <div className="overflow-hidden rounded-md border">
              <ScrollArea className="h-100">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Customer Name
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Outstanding
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        Settlements
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background">
                    {mockRecords.slice(0, 50).map((record) => (
                      <tr key={record.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{record.customerName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {record.phone}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{record.email}</td>
                        <td className="px-4 py-3 font-semibold">
                          ₹{record.outstandingAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          {record.settlements}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
            <div className="mt-3 text-center text-xs text-muted-foreground">
              Showing 50 of {totalRecords.toLocaleString()} records
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Selection Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Selection Criteria</DialogTitle>
            <DialogDescription>
              Refine the selection by applying filters for amount and settlement count
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Amount Filter */}
            <div className="space-y-2">
              <Label htmlFor="amount-filter" className="text-sm font-medium">
                Outstanding Amount
              </Label>
              <Select value={tempAmountFilter} onValueChange={setTempAmountFilter}>
                <SelectTrigger id="amount-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="25000-50000">₹25,000 - ₹50,000</SelectItem>
                  <SelectItem value="50000-75000">₹50,000 - ₹75,000</SelectItem>
                  <SelectItem value="75000-100000">₹75,000 - ₹1,00,000</SelectItem>
                  <SelectItem value="100000+">₹1,00,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Settlement Filter */}
            <div className="space-y-2">
              <Label htmlFor="settlement-filter" className="text-sm font-medium">
                Settlement Count
              </Label>
              <Select value={tempSettlementFilter} onValueChange={setTempSettlementFilter}>
                <SelectTrigger id="settlement-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>

                  <SelectItem value="2">2 Settlements</SelectItem>
                  <SelectItem value="3+">3+ Settlements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
