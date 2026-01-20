'use client';

import { useForm } from '@tanstack/react-form';
import { Briefcase, CheckCircle2, IndianRupee, MapPin, Send, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { cn } from '@/lib/utils';

export const InterestedDetailsForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      employmentType: '',
      monthlyIncome: '',
      loanAmount: '',
      purpose: '',
      state: '',
      city: '',
      pincode: '',
    },
    onSubmit: async () => {
      setIsSubmitted(true);
    },
  });

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Application Submitted!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you for sharing your details. Our financial advisor will review your application
            and contact you within 24 hours.
          </p>
        </div>
        <Button variant="outline" className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="space-y-2 mb-8 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
          Tell us about yourself
        </h1>
        <p className="text-muted-foreground text-lg">
          We need a few more details to offer you the best credit solutions.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-8"
      >
        <div className="grid gap-8 md:grid-cols-2">
          {/* Personal Information */}
          <Card className="border-none shadow-xl shadow-orange-100/50 dark:shadow-none dark:bg-slate-900/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <User className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Personal Details
                </span>
              </div>
              <CardTitle className="text-xl">Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form.Field name="fullName">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-semibold">
                      Full Name (As per PAN)
                    </FieldLabel>
                    <Input
                      placeholder="Enter your full name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 bg-muted/30 border-none focus-visible:ring-orange-500"
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-semibold">Email Address</FieldLabel>
                    <Input
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 bg-muted/30 border-none focus-visible:ring-orange-500"
                    />
                  </div>
                )}
              </form.Field>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-none shadow-xl shadow-orange-100/50 dark:shadow-none dark:bg-slate-900/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <Briefcase className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Employment</span>
              </div>
              <CardTitle className="text-xl">Professional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form.Field name="employmentType">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-semibold">Employment Type</FieldLabel>
                    <Select onValueChange={field.handleChange} defaultValue={field.state.value}>
                      <SelectTrigger className="h-12 bg-muted/30 border-none focus:ring-orange-500">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salaried">Salaried</SelectItem>
                        <SelectItem value="self-employed">Self Employed</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
              <form.Field name="monthlyIncome">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-semibold">Monthly Income</FieldLabel>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="e.g. 50000"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 pl-9 bg-muted/30 border-none focus-visible:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
              </form.Field>
            </CardContent>
          </Card>

          {/* Loan details Information */}
          <Card className="border-none shadow-xl shadow-orange-100/50 dark:shadow-none dark:bg-slate-900/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <IndianRupee className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Requirements</span>
              </div>
              <CardTitle className="text-xl">Loan Preference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form.Field name="loanAmount">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-semibold">Desired Loan Amount</FieldLabel>
                    <Input
                      type="number"
                      placeholder="e.g. 500000"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 bg-muted/30 border-none focus-visible:ring-orange-500"
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="purpose">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-semibold">Purpose of Loan</FieldLabel>
                    <Select onValueChange={field.handleChange} defaultValue={field.state.value}>
                      <SelectTrigger className="h-12 bg-muted/30 border-none focus:ring-orange-500">
                        <SelectValue placeholder="Reason for loan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                        <SelectItem value="home-improvement">Home Improvement</SelectItem>
                        <SelectItem value="business-expansion">Business Expansion</SelectItem>
                        <SelectItem value="marriage">Marriage</SelectItem>
                        <SelectItem value="medical">Medical Emergency</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-none shadow-xl shadow-orange-100/50 dark:shadow-none dark:bg-slate-900/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <MapPin className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Location</span>
              </div>
              <CardTitle className="text-xl">Current Residence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="state">
                  {(field) => (
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-semibold">State</FieldLabel>
                      <Input
                        placeholder="State"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 bg-muted/30 border-none focus-visible:ring-orange-500"
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="city">
                  {(field) => (
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-semibold">City</FieldLabel>
                      <Input
                        placeholder="City"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 bg-muted/30 border-none focus-visible:ring-orange-500"
                      />
                    </div>
                  )}
                </form.Field>
              </div>
              <form.Field name="pincode">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel className="text-sm font-semibold">Pincode</FieldLabel>
                    <Input
                      placeholder="6-digit Pincode"
                      maxLength={6}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.replace(/[^0-9]/g, ''))}
                      className="h-12 bg-muted/30 border-none focus-visible:ring-orange-500"
                    />
                  </div>
                )}
              </form.Field>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-8">
          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto px-12 h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center gap-2 group"
          >
            Submit Application
            <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>
      </form>
    </div>
  );
};
