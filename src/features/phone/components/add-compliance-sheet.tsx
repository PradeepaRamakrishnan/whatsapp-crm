/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
'use client';

import { Loader2, ShieldCheck, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
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

interface AddComplianceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddComplianceSheet({ open, onOpenChange, onSuccess }: AddComplianceSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    alias: '',
    country: 'India',
    numberType: 'local',
    businessName: '',
    certificateFile: null as File | null,
    gstFile: null as File | null,
    agreed: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) {
      toast.error('You must agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Compliance documents submitted successfully');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (_error) {
      toast.error('Submission failed');
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
                Add Compliance
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
                  onValueChange={(val) => setFormData({ ...formData, country: val })}
                >
                  <SelectTrigger className="border-slate-300 h-11 rounded-lg bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span>🇮🇳</span>
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

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Number Type</Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.numberType === 'local' ? 'border-primary bg-primary/10' : 'border-slate-300'}`}
                    >
                      {formData.numberType === 'local' && (
                        <div className="size-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      name="numberType"
                      value="local"
                      checked={formData.numberType === 'local'}
                      onChange={() => setFormData({ ...formData, numberType: 'local' })}
                    />
                    <span
                      className={`text-sm ${formData.numberType === 'local' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}
                    >
                      Local
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.numberType === 'tollfree' ? 'border-primary bg-primary/10' : 'border-slate-300'}`}
                    >
                      {formData.numberType === 'tollfree' && (
                        <div className="size-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      name="numberType"
                      value="tollfree"
                      checked={formData.numberType === 'tollfree'}
                      onChange={() => setFormData({ ...formData, numberType: 'tollfree' })}
                    />
                    <span
                      className={`text-sm ${formData.numberType === 'tollfree' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}
                    >
                      Toll Free
                    </span>
                  </label>
                </div>
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
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
