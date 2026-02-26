/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
'use client';

import { CheckCircle2, Globe, Loader2, Phone, ShieldCheck } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/context';
import { phoneNumberService } from '../services/phone.service';

interface BuyNumberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  numberData: any | null;
  onSuccess: () => void;
}

export function BuyNumberSheet({ open, onOpenChange, numberData, onSuccess }: BuyNumberSheetProps) {
  const { user } = useAuth();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleBuy = async () => {
    if (!numberData || !user?.id) return;

    setIsPending(true);
    setError(null);
    try {
      await phoneNumberService.buyNumber(numberData.number, user.id);
      toast.success(`Successfully purchased ${numberData.number}`);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to purchase number';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  };

  if (!numberData) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 overflow-hidden gap-0 flex flex-col sm:max-w-[500px]">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-semibold text-[#1e293b] flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                Verify & Purchase Number
              </SheetTitle>
              <SheetDescription className="text-sm text-[#64748b]">
                Review the number details and costs before confirming your purchase.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Number Identity Card */}
              <div className="rounded-xl border-2 border-primary bg-primary/[0.02] p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                      Target Number
                    </p>
                    <h3 className="text-2xl font-bold text-[#1e293b]">{numberData.number}</h3>
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">
                    Available
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                  <div>
                    <p className="text-[10px] text-[#64748b] uppercase font-bold">Region</p>
                    <p className="text-sm font-medium text-[#334155]">
                      {numberData.region || 'National'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#64748b] uppercase font-bold">Type</p>
                    <p className="text-sm font-medium text-[#334155] capitalize">
                      {numberData.type || 'Local'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis & Cost Breakdown */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
                <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-5 py-3">
                  <h4 className="text-sm font-semibold text-[#1e293b] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Purchase Analysis
                  </h4>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#64748b]">Monthly Rental</span>
                    <span className="font-bold text-[#1e293b]">
                      ₹{numberData.monthly_rental_rate_inr || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#64748b]">Setup Fee</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#64748b]">Call Capability</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#64748b]">SMS Capability</span>
                    {numberData.sms_enabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-xs text-amber-600 font-medium italic">
                        Check availability
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 px-5 py-3 border-t border-amber-100 italic">
                  <p className="text-[10px] text-amber-800 leading-relaxed font-medium flex gap-2">
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    Purchasing this number will immediately deduct the monthly fee from your account
                    balance.
                  </p>
                </div>
              </div>

              {/* Compliance Note */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  By clicking "Confirm Purchase", you agree to terms of service and acknowledge that
                  some regions require regulatory documentation for ownership.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto border-t bg-[#f8fafc] px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button className="flex-1 font-medium" onClick={handleBuy} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Purchase'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
