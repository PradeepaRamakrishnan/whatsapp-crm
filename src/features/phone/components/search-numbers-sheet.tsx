/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
'use client';

import { Loader2, Phone, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context';
import { phoneNumberService } from '../services/phone.service';
import { NumberSearchForm } from './number-search-form';

interface SearchNumbersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectNumber: (numberData: any) => void;
}

export function SearchNumbersSheet({
  open,
  onOpenChange,
  onSelectNumber,
}: SearchNumbersSheetProps) {
  const { user } = useAuth();
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (country: string, type: string) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }
    setIsLoading(true);
    try {
      const numbers = await phoneNumberService.searchNumbers(country, type, user.id);
      setAvailableNumbers(numbers);
      if (numbers.length === 0) {
        toast.info('No numbers found for the selected criteria');
      }
    } catch (error) {
      toast.error(`Search failed: ${(error as any).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 overflow-hidden gap-0 flex flex-col sm:max-w-[700px]">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-semibold text-[#1e293b] flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                Search Available Numbers
              </SheetTitle>
              <SheetDescription className="text-sm text-[#64748b]">
                Find and select a phone number to purchase from Plivo.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <NumberSearchForm onSearch={handleSearch} isLoading={isLoading} />

              <div className="border rounded-md min-h-[300px] bg-slate-50/50">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Searching Plivo inventory...</p>
                  </div>
                ) : availableNumbers.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-white">
                      <TableRow>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Monthly Fee</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableNumbers.map((item) => (
                        <TableRow key={item.number} className="bg-white overflow-y-auto">
                          <TableCell className="font-medium">{item.number}</TableCell>
                          <TableCell>{item.region || 'N/A'}</TableCell>
                          <TableCell>${item.monthly_rental_rate || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                onSelectNumber(item);
                                onOpenChange(false);
                              }}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-center">
                    <Phone className="h-8 w-8 mb-4 opacity-20" />
                    <p>Enter search criteria to find available numbers.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
