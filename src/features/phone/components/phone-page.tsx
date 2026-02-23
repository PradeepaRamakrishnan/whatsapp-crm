/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
'use client';

import dayjs from 'dayjs';
import { Loader2, Pencil, Phone, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context';
import { phoneNumberService } from '../services/phone.service';
import { AddComplianceSheet } from './add-compliance-sheet';
import { BuyNumberSheet } from './buy-number-sheet';
import { SearchNumbersSheet } from './search-numbers-sheet';

export default function PhoneNumberPage() {
  const { user } = useAuth();
  const [myNumbers, setMyNumbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState<any | null>(null);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [isBuySheetOpen, setIsBuySheetOpen] = useState(false);
  const [isComplianceSheetOpen, setIsComplianceSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rentalSearchTerm, setRentalSearchTerm] = useState('');
  const [senderIdSearchTerm, setSenderIdSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('purchased');

  // Compliance state
  const [complianceSearchTerm, setComplianceSearchTerm] = useState('');
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [isComplianceLoading, setIsComplianceLoading] = useState(false);

  const loadCompliance = useCallback(async () => {
    if (!user?.id) return;
    setIsComplianceLoading(true);
    try {
      const response = await phoneNumberService.getMyCompliance(user.id);
      setComplianceData(response.data || []);
    } catch (error) {
      console.error('Failed to load compliance data', error);
      toast.error('Failed to load compliance data');
    } finally {
      setIsComplianceLoading(false);
    }
  }, [user?.id]);

  const loadMyNumbers = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await phoneNumberService.getMyNumbers(user.id);
      setMyNumbers(response.data || []);
    } catch (error) {
      console.error('Failed to load my numbers', error);
      toast.error('Failed to load purchased numbers');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMyNumbers();
    loadCompliance();
  }, [loadMyNumbers, loadCompliance]);

  const handleSelectForPurchase = (numberData: any) => {
    setSelectedNumber(numberData);
    setIsSearchSheetOpen(false);
    setIsBuySheetOpen(true);
  };

  const handlePurchaseSuccess = () => {
    loadMyNumbers();
    setIsBuySheetOpen(false);
  };

  const handleDelete = async (numId: string) => {
    if (!user?.id) return;
    if (
      !confirm(
        'Are you sure you want to delete this phone number? This might unrent it from Plivo.',
      )
    )
      return;

    try {
      await phoneNumberService.deleteNumber(numId, user.id);
      toast.success('Phone number deleted successfully');
      loadMyNumbers();
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('Failed to delete phone number');
    }
  };

  const handleEditAlias = async (numId: string, currentAlias?: string) => {
    if (!user?.id) return;
    const newAlias = prompt('Enter new alias for this number:', currentAlias || '');
    if (newAlias === null) return;

    try {
      await phoneNumberService.updateNumber(numId, user.id, { alias: newAlias });
      toast.success('Alias updated successfully');
      loadMyNumbers();
    } catch (error) {
      console.error('Update failed', error);
      toast.error('Failed to update alias');
    }
  };

  const filteredNumbers = myNumbers.filter((num) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const phone = String(num.phoneNumber || '').toLowerCase();
    const alias = String(num.alias || '').toLowerCase();
    return phone.includes(query) || alias.includes(query);
  });

  const filteredRentalSummary = myNumbers.filter((num) => {
    const query = rentalSearchTerm.trim().toLowerCase();
    if (!query) return true;

    return String(num.phoneNumber || '')
      .toLowerCase()
      .includes(query);
  });
  console.info('filteredRentalSummary', filteredRentalSummary);
  const getCountryFlag = (country?: string) => {
    const c = (country || 'india').toLowerCase();
    if (c.includes('india')) return '🇮🇳';
    if (c.includes('usa') || c.includes('united states')) return '🇺🇸';
    if (c.includes('uk') || c.includes('united kingdom')) return '🇬🇧';
    return '🌐';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Phone Number</h1>
          <p className="text-muted-foreground text-lg">Manage your business phone numbers.</p>
        </div>
        {activeTab === 'purchased' ? (
          <Button onClick={() => setIsSearchSheetOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Buy Number
          </Button>
        ) : activeTab === 'compliance' ? (
          <Button onClick={() => setIsComplianceSheetOpen(true)} className="gap-2 ">
            <Plus className="h-4 w-4" />
            Add Compliance
          </Button>
        ) : activeTab === 'sender-id' ? (
          <Button
            onClick={() => toast.info('Add Sender ID feature coming soon')}
            className="gap-2 "
          >
            <Plus className="h-4 w-4" />
            Add Sender ID
          </Button>
        ) : null}
      </div>

      <Tabs
        defaultValue="purchased"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="purchased">Purchased Numbers</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="sender-id">Sender ID</TabsTrigger>
          <TabsTrigger value="rental-summary">Rental Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="purchased" className="space-y-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="space-y-4">
              <CardTitle className="sr-only">Phone Number Listing</CardTitle>
              <CardDescription className="sr-only">
                A list of all numbers active in your CRM.
              </CardDescription>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-wrap gap-2">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by number or alias..."
                    className="w-full lg:w-[320px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold">Phone Number</TableHead>
                        <TableHead className="font-bold">Type</TableHead>
                        <TableHead className="font-bold">Capability</TableHead>
                        <TableHead className="font-bold">Compliance Status</TableHead>
                        <TableHead className="font-bold">Purchased At</TableHead>
                        <TableHead className="text-right font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNumbers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-28 text-center text-base">
                            No data found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNumbers.map((num) => (
                          <TableRow key={num.id} className="hover:bg-slate-50/30 transition-colors">
                            <TableCell className="font-semibold text-slate-700">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center size-5 rounded-full bg-slate-100 text-xs overflow-hidden border border-slate-200">
                                  {getCountryFlag(num.country)}
                                </span>
                                {num.phoneNumber}
                              </div>
                            </TableCell>

                            <TableCell>{num.type || 'Local'}</TableCell>
                            <TableCell>
                              <Phone className="h-4 w-4 text-primary" />
                            </TableCell>
                            <TableCell>{num.complianceStatus || num.status || '-'}</TableCell>
                            <TableCell className="text-slate-500 text-sm">
                              {dayjs(num.createdAt).format('MMM D, YYYY')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-primary"
                                  onClick={() => handleEditAlias(num.id, num.alias)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-destructive"
                                  onClick={() => handleDelete(num.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4 pt-1">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-wrap gap-2 items-center">
                  <div className="relative w-full lg:w-[280px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={complianceSearchTerm}
                      onChange={(e) => setComplianceSearchTerm(e.target.value)}
                      placeholder="Search by alias..."
                      className="pl-9 bg-white"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold">Alias</TableHead>
                      <TableHead className="font-bold">Country</TableHead>
                      <TableHead className="font-bold">Number Type</TableHead>
                      <TableHead className="font-bold">Documents</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isComplianceLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-300" />
                        </TableCell>
                      </TableRow>
                    ) : (complianceData || []).filter((item) => {
                        const query = complianceSearchTerm.trim().toLowerCase();
                        if (!query) return true;
                        return (
                          String(item.alias || '')
                            .toLowerCase()
                            .includes(query) ||
                          String(item.country || '')
                            .toLowerCase()
                            .includes(query)
                        );
                      }).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-48 text-center text-slate-500 text-base"
                        >
                          No data found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (complianceData || [])
                        .filter((item) => {
                          const query = complianceSearchTerm.trim().toLowerCase();
                          if (!query) return true;
                          return (
                            String(item.alias || '')
                              .toLowerCase()
                              .includes(query) ||
                            String(item.country || '')
                              .toLowerCase()
                              .includes(query)
                          );
                        })
                        .map((item) => (
                          <TableRow key={item.id || `${item.alias}-${item.country}`}>
                            <TableCell className="font-medium">{item.alias}</TableCell>
                            <TableCell>{item.country}</TableCell>
                            <TableCell className="capitalize">{item.numberType}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {item.certificateRegistrationUrl && (
                                  <a
                                    href={item.certificateRegistrationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ShieldCheck className="h-3 w-3" /> Certificate
                                  </a>
                                )}
                                {item.gstCertificateUrl && (
                                  <a
                                    href={item.gstCertificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ShieldCheck className="h-3 w-3" /> GST Certificate
                                  </a>
                                )}
                                {!item.certificateRegistrationUrl && !item.gstCertificateUrl && '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                  item.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : item.status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sender-id" className="space-y-4 pt-1">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-wrap gap-2">
                  <Input
                    value={senderIdSearchTerm}
                    onChange={(e) => setSenderIdSearchTerm(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full lg:w-[320px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold">Sender ID</TableHead>
                      <TableHead className="font-bold">Countries</TableHead>
                      <TableHead className="font-bold">Alias</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={3} className="h-48 text-center text-slate-500 text-base">
                        No data found.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rental-summary" className="space-y-4 pt-1">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-wrap gap-2">
                  <Input
                    value={rentalSearchTerm}
                    onChange={(e) => setRentalSearchTerm(e.target.value)}
                    placeholder="Search by number..."
                    className="w-full lg:w-[320px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold">Date Deducted</TableHead>
                      <TableHead className="font-bold">Number</TableHead>
                      <TableHead className="font-bold">Country</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Capabilities</TableHead>
                      <TableHead className="font-bold">Deducted amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-300" />
                        </TableCell>
                      </TableRow>
                    ) : filteredRentalSummary.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                          No rental history found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRentalSummary.map((num) => (
                        <TableRow key={num.id} className="hover:bg-slate-50/30 transition-colors">
                          <TableCell className="text-slate-600">
                            {dayjs(num.createdAt).format('MMM D, YYYY h:mm A')}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center size-5 rounded-full bg-slate-100 text-xs overflow-hidden border border-slate-200">
                                {getCountryFlag(num.country)}
                              </span>
                              {num.phoneNumber}
                            </div>
                          </TableCell>
                          <TableCell>{num.country || ''}</TableCell>
                          <TableCell>{num.type || ''}</TableCell>
                          <TableCell>
                            <div className="inline-flex items-center justify-center p-2 bg-slate-100 rounded-lg">
                              <Phone className="h-4 w-4 text-primary" />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-700">
                            ₹{num.amount || ''}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SearchNumbersSheet
        open={isSearchSheetOpen}
        onOpenChange={setIsSearchSheetOpen}
        onSelectNumber={handleSelectForPurchase}
      />

      <BuyNumberSheet
        open={isBuySheetOpen}
        onOpenChange={setIsBuySheetOpen}
        numberData={selectedNumber}
        onSuccess={handlePurchaseSuccess}
      />

      <AddComplianceSheet
        open={isComplianceSheetOpen}
        onOpenChange={setIsComplianceSheetOpen}
        onSuccess={loadCompliance}
      />
    </div>
  );
}
