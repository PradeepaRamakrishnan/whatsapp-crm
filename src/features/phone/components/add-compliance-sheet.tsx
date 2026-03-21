/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <> */
'use client';

import { Loader2, ShieldCheck, Upload } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/context';
import { phoneNumberService } from '../services/phone.service';

interface AddComplianceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function AddComplianceSheet({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: AddComplianceSheetProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [purchasedNumbers, setPurchasedNumbers] = useState<any[]>([]);
  const [isNumbersLoading, setIsNumbersLoading] = useState(false);
  const [existingCertificateUrl, setExistingCertificateUrl] = useState('');
  const [existingGstUrl, setExistingGstUrl] = useState('');
  const [formData, setFormData] = useState({
    alias: '',
    country: 'India',
    numberType: 'local',
    businessName: '',
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    endUserType: 'business' as 'individual' | 'business',
    operationType: 'direct_brand' as 'direct_brand' | 'reseller',
    addressLine1: '',
    city: '',
    region: '',
    postalCode: '',
    certificateFile: null as File | null,
    gstFile: null as File | null,
    agreed: false,
  });

  const pickFirst = (...values: any[]) => values.find((v) => v !== undefined && v !== null) || '';

  const getFileNameFromUrl = (url: string) => {
    try {
      return decodeURIComponent(url.split('?')[0].split('/').pop() || 'Uploaded document');
    } catch {
      return 'Uploaded document';
    }
  };

  useEffect(() => {
    if (initialData && open) {
      const certUrl = pickFirst(
        initialData.certificateRegistrationUrl,
        initialData.certificate_registration_url,
        initialData.certificateUrl,
      );
      const gstUrl = pickFirst(
        initialData.gstCertificateUrl,
        initialData.gst_certificate_url,
        initialData.gstUrl,
      );
      setExistingCertificateUrl(String(certUrl || ''));
      setExistingGstUrl(String(gstUrl || ''));

      setFormData({
        alias: pickFirst(initialData.alias, initialData.name),
        country: pickFirst(initialData.country, initialData.countryIso, 'India'),
        numberType: 'local',
        businessName: pickFirst(initialData.businessName, initialData.business_name),
        firstName: pickFirst(initialData.firstName, initialData.first_name),
        lastName: pickFirst(initialData.lastName, initialData.last_name),
        email: user?.email || pickFirst(initialData.email, initialData.emailId),
        phone: pickFirst(initialData.phone, initialData.phoneNumber),
        endUserType: 'business',
        operationType: 'direct_brand',
        addressLine1: pickFirst(initialData.addressLine1, initialData.address_line_1),
        city: pickFirst(initialData.city, initialData.locality),
        region: pickFirst(initialData.region, initialData.state),
        postalCode: pickFirst(initialData.postalCode, initialData.postal_code, initialData.zipCode),
        certificateFile: null,
        gstFile: null,
        agreed: true,
      });
    } else if (!open) {
      setExistingCertificateUrl('');
      setExistingGstUrl('');
      // Reset on close
      setFormData({
        alias: '',
        country: 'India',
        numberType: 'local',
        businessName: '',
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        endUserType: 'business',
        operationType: 'direct_brand',
        addressLine1: '',
        city: '',
        region: '',
        postalCode: '',
        certificateFile: null,
        gstFile: null,
        agreed: false,
      });
    } else if (open && !initialData) {
      setFormData((prev) => ({ ...prev, email: user?.email || '' }));
    }
  }, [initialData, open, user?.email]);

  useEffect(() => {
    const loadPurchasedNumbers = async () => {
      if (!open || !user?.id) return;
      setIsNumbersLoading(true);
      try {
        const response = await phoneNumberService.getMyNumbers(user.id);
        setPurchasedNumbers(response.data || []);
      } catch {
        setPurchasedNumbers([]);
      } finally {
        setIsNumbersLoading(false);
      }
    };

    loadPurchasedNumbers();
  }, [open, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) {
      toast.error('You must agree to the terms and conditions');
      return;
    }

    if (!user?.id) {
      toast.error('User session not found');
      return;
    }

    if (
      !formData.alias ||
      !formData.country ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    const submissionData = new FormData();
    submissionData.append('alias', formData.alias);
    submissionData.append('country', formData.country);
    submissionData.append('numberType', 'local');
    submissionData.append('userId', user.id);
    submissionData.append('firstName', formData.firstName);
    submissionData.append('lastName', formData.lastName);
    submissionData.append('email', formData.email);
    submissionData.append('phone', formData.phone);
    submissionData.append('endUserType', 'business');
    submissionData.append('operationType', 'direct_brand');
    if (formData.addressLine1) submissionData.append('addressLine1', formData.addressLine1);
    if (formData.city) submissionData.append('city', formData.city);
    if (formData.region) submissionData.append('region', formData.region);
    if (formData.postalCode) submissionData.append('postalCode', formData.postalCode);

    if (formData.businessName) submissionData.append('businessName', formData.businessName);
    if (formData.certificateFile)
      submissionData.append('certificateRegistration', formData.certificateFile);
    if (formData.gstFile) submissionData.append('gstCertificate', formData.gstFile);

    setIsLoading(true);
    try {
      if (initialData?.id) {
        await phoneNumberService.updateCompliance(initialData.id, submissionData);
        toast.success('Compliance documents updated successfully');
      } else {
        await phoneNumberService.submitCompliance(submissionData);
        toast.success('Compliance documents submitted successfully');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Submission failed';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 overflow-hidden gap-0 flex flex-col sm:max-w-[550px]">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                {initialData ? 'Edit Compliance' : 'Add Compliance'}
              </SheetTitle>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-6 pb-24">
              <div className="space-y-2">
                <Label htmlFor="alias" className="text-slate-700 font-medium">
                  Alias
                </Label>
                <Input
                  id="alias"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="border-slate-300 focus:border-primary h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(val) => {
                    const updates: any = { country: val };
                    if (val === 'India') {
                      updates.endUserType = 'business';
                    }
                    setFormData({ ...formData, ...updates });
                  }}
                >
                  <SelectTrigger className="border-slate-300 h-11 rounded-lg bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span>
                        {formData.country === 'India'
                          ? '🇮🇳'
                          : formData.country === 'USA'
                            ? '🇺🇸'
                            : '🇬🇧'}
                      </span>
                      <SelectValue placeholder="Select Country" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="border-slate-300 focus:border-primary h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="border-slate-300 focus:border-primary h-11 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="border-slate-300 focus:border-primary h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">
                  Purchased Number *
                </Label>
                <Select
                  value={formData.phone}
                  onValueChange={(val) => val && setFormData({ ...formData, phone: val })}
                  disabled={isNumbersLoading}
                >
                  <SelectTrigger className="border-slate-300 h-11 rounded-lg bg-slate-50/50">
                    <SelectValue
                      placeholder={
                        isNumbersLoading ? 'Loading numbers...' : 'Select purchased number'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {purchasedNumbers.length > 0 ? (
                      purchasedNumbers.map((num) => (
                        <SelectItem key={num.id} value={num.phoneNumber}>
                          {num.phoneNumber}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_numbers__" disabled>
                        No purchased numbers found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine1" className="text-slate-700 font-medium">
                  Address Line 1
                </Label>
                <Input
                  id="addressLine1"
                  placeholder="Street address..."
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="border-slate-300 focus:border-primary h-11 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-slate-700 font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="San Francisco"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="border-slate-300 focus:border-primary h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-slate-700 font-medium">
                    Region/State
                  </Label>
                  <Input
                    id="region"
                    placeholder="State/Region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="border-slate-300 focus:border-primary h-11 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-slate-700 font-medium">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  placeholder="Zip/Postal Code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="border-slate-300 focus:border-primary h-11 rounded-lg"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">Compliance Documents</h3>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                  <h4 className="font-semibold text-sm text-slate-800">Certificate Registration</h4>
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-xs text-slate-600 font-medium">
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      placeholder="Enter business name"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="bg-white border-slate-200 h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 font-medium">
                      Upload Certificate Registration{' '}
                      <span className="text-slate-400 font-normal">(.pdf,.png,.jpeg,.jpg)</span>
                    </Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 bg-white hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer relative group">
                      <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                        <Upload className="h-6 w-6 text-slate-400 group-hover:text-primary" />
                      </div>
                      <p className="text-xs text-slate-500">Drag file here or click to upload</p>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) =>
                          setFormData({ ...formData, certificateFile: e.target.files?.[0] || null })
                        }
                      />
                      {formData.certificateFile && (
                        <p className="text-xs font-semibold text-primary mt-2 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {formData.certificateFile.name}
                        </p>
                      )}
                      {!formData.certificateFile && existingCertificateUrl && (
                        <a
                          href={existingCertificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-primary mt-2 hover:underline"
                        >
                          Existing: {getFileNameFromUrl(existingCertificateUrl)}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                  <h4 className="font-semibold text-sm text-slate-800">GST certificate</h4>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 font-medium">
                      Upload GST certificate{' '}
                      <span className="text-slate-400 font-normal">(.pdf,.png,.jpeg,.jpg)</span>
                    </Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 bg-white hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer relative group">
                      <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                        <Upload className="h-6 w-6 text-slate-400 group-hover:text-primary" />
                      </div>
                      <p className="text-xs text-slate-500">Drag file here or click to upload</p>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) =>
                          setFormData({ ...formData, gstFile: e.target.files?.[0] || null })
                        }
                      />
                      {formData.gstFile && (
                        <p className="text-xs font-semibold text-primary mt-2 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {formData.gstFile.name}
                        </p>
                      )}
                      {!formData.gstFile && existingGstUrl && (
                        <a
                          href={existingGstUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-primary mt-2 hover:underline"
                        >
                          Existing: {getFileNameFromUrl(existingGstUrl)}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start px-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreed}
                  onCheckedChange={(val) => setFormData({ ...formData, agreed: !!val })}
                  className="mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-xs text-slate-500 leading-relaxed font-normal"
                >
                  By checking this box, you agree to our Terms of Service and applicable telecom
                  regulations. All communication must follow consent and opt-out rules.
                </Label>
              </div>
            </form>
          </div>
        </div>

        <div className="p-6 border-t bg-white flex justify-end gap-3 absolute bottom-0 left-0 right-0 z-10">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-8 rounded-lg">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.agreed}
            className=" text-white min-w-[120px] rounded-lg shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : initialData ? (
              'Update'
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
