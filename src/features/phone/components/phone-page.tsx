/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
/** biome-ignore-all lint/performance/noImgElement: <> */
'use client';

import * as Flags from 'country-flag-icons/react/3x2';
import dayjs from 'dayjs';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Edit, Loader2, Phone, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [numberToDelete, setNumberToDelete] = useState<string | null>(null);

  const [complianceToDelete, setComplianceToDelete] = useState<any | null>(null);
  const [isDeleteComplianceDialogOpen, setIsDeleteComplianceDialogOpen] = useState(false);
  const [complianceToEdit, setComplianceToEdit] = useState<any | null>(null);

  // Doc Viewer state
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [activeDocs, setActiveDocs] = useState<{ url: string; title: string }[]>([]);
  const [docViewerTitle, setDocViewerTitle] = useState('');

  const loadCompliance = useCallback(async () => {
    if (!user?.id) return;
    setIsComplianceLoading(true);
    try {
      const response = await phoneNumberService.getMyCompliance(user.id);
      setComplianceData(response.data || []);
    } catch (error: any) {
      console.error('Failed to load compliance data', error);
      toast.error(error.message || 'Failed to load compliance data');
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
    } catch (error: any) {
      console.error('Failed to load my numbers', error);
      toast.error(error.message || 'Failed to load purchased numbers');
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

  const openDeleteConfirm = (numId: string) => {
    setNumberToDelete(numId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!user?.id || !numberToDelete) return;

    try {
      await phoneNumberService.deleteNumber(numberToDelete, user.id);
      toast.success('Phone number deleted successfully');
      loadMyNumbers();
    } catch (error: any) {
      console.error('Delete failed', error);
      toast.error(error.message || 'Failed to delete phone number');
    } finally {
      setIsDeleteDialogOpen(false);
      setNumberToDelete(null);
    }
  };

  const handleDeleteCompliance = (compliance: any) => {
    setComplianceToDelete(compliance);
    setIsDeleteComplianceDialogOpen(true);
  };

  const confirmDeleteCompliance = async () => {
    if (!complianceToDelete || !user?.id) return;
    try {
      await phoneNumberService.deleteCompliance(complianceToDelete.id, user.id);
      toast.success('Compliance record deleted successfully');
      loadCompliance();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete compliance record');
    } finally {
      setIsDeleteComplianceDialogOpen(false);
      setComplianceToDelete(null);
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
  const getCountryISO = (country?: string, phoneNumber?: string) => {
    const normalize = (s?: string) => (s || '').toLowerCase().trim();
    const c = normalize(country);

    if (c.includes('india') || c === 'in') return 'IN';
    if (c.includes('usa') || c.includes('united states') || c === 'us') return 'US';
    if (c.includes('uk') || c.includes('united kingdom') || c === 'gb') return 'GB';
    if (c.includes('uae') || c.includes('emirates') || c === 'ae') return 'AE';
    if (c.includes('australia') || c === 'au') return 'AU';
    if (c.includes('canada') || c === 'ca') return 'CA';
    if (c.includes('singapore') || c === 'sg') return 'SG';

    if (phoneNumber) {
      try {
        const parsed = parsePhoneNumberFromString(
          phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
        );
        if (parsed?.country) return parsed.country;
      } catch (err) {
        console.warn('Failed to parse phone number for country ISO', err);
      }
    }

    return null;
  };

  const getCountryFlag = (country?: string, phoneNumber?: string) => {
    const isoCode = getCountryISO(country, phoneNumber);

    if (isoCode) {
      const FlagComponent = (Flags as any)[isoCode.toUpperCase()];
      if (FlagComponent) {
        return <FlagComponent className="w-full h-full" />;
      }
    }

    return <Flags.IN className="w-full h-full opacity-20" />; // Fallback or global icon
  };

  return (
    <div className="p-3 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Phone Number</h1>
          <p className="text-muted-foreground ">Manage your business phone numbers.</p>
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
                                <span className="flex items-center justify-center size-5 rounded-sm overflow-hidden border border-slate-200 shrink-0">
                                  {getCountryFlag(num.country, num.phoneNumber)}
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
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-destructive"
                                  onClick={() => openDeleteConfirm(num.id)}
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
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isComplianceLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
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
                          colSpan={6}
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
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDocs([
                                        {
                                          url: item.certificateRegistrationUrl,
                                          title: 'Certificate of Registration',
                                        },
                                      ]);
                                      setDocViewerTitle(item.alias || 'Compliance Document');
                                      setIsDocViewerOpen(true);
                                    }}
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ShieldCheck className="h-3 w-3" /> Certificate
                                  </button>
                                )}
                                {item.gstCertificateUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDocs([
                                        { url: item.gstCertificateUrl, title: 'GST Certificate' },
                                      ]);
                                      setDocViewerTitle(item.alias || 'Compliance Document');
                                      setIsDocViewerOpen(true);
                                    }}
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ShieldCheck className="h-3 w-3" /> GST Certificate
                                  </button>
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
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                                  onClick={() => {
                                    setComplianceToEdit(item);
                                    setIsComplianceSheetOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                  onClick={() => handleDeleteCompliance(item)}
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
                              <span className="flex items-center justify-center size-5 rounded-sm overflow-hidden border border-slate-200 shrink-0">
                                {getCountryFlag(num.country, num.phoneNumber)}
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
        onOpenChange={(open) => {
          setIsComplianceSheetOpen(open);
          if (!open) setComplianceToEdit(null);
        }}
        onSuccess={loadCompliance}
        initialData={complianceToEdit}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the phone number and may
              unrent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white border-none"
            >
              Delete Number
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteComplianceDialogOpen}
        onOpenChange={setIsDeleteComplianceDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Compliance?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the compliance record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCompliance}
              className="bg-red-500 hover:bg-red-600 text-white border-none"
            >
              Delete Compliance
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDocViewerOpen} onOpenChange={setIsDocViewerOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>{docViewerTitle}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 w-full">
            <div className="flex flex-col gap-8 p-6 items-center">
              {activeDocs.map((doc, idx) => (
                <div key={`${doc.url}-${idx}`} className="w-full space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-sm font-semibold text-slate-700">{doc.title}</h4>
                  </div>
                  <div className="relative w-full border rounded-xl overflow-hidden bg-slate-50 shadow-sm">
                    <img
                      src={doc.url}
                      alt={doc.title}
                      className="w-full h-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/800x1200?text=Failed+to+load+image';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
