'use client';

import { AlertCircle, CheckCircle2, FileSpreadsheet, Info, Upload, X, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type ValidationError = {
  row: number;
  field: string;
  message: string;
};

export type FileValidationResult = {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  missingFields?: string[];
  totalLoanAmount?: number;
  settlementCountLessThan2?: number;
  totalOutstandingAmount?: number;
};

type BorrowersFileUploadProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  validationResult?: FileValidationResult | null;
  bank?: string;
  onBankChange?: (bank: string) => void;
  customFileName?: string;
  onCustomFileNameChange?: (name: string) => void;
};

export function BorrowersFileUpload({
  file,
  onFileChange,
  validationResult,
  bank = '',
  onBankChange,
  customFileName = '',
  onCustomFileNameChange,
}: BorrowersFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        const selectedFile = droppedFiles[0];
        if (
          selectedFile.type === 'text/csv' ||
          selectedFile.name.endsWith('.csv') ||
          selectedFile.name.endsWith('.xlsx') ||
          selectedFile.name.endsWith('.xls')
        ) {
          onFileChange(selectedFile);
        }
      }
    },
    [onFileChange],
  );

  const handleFileSelect = useCallback(
    (selectedFile: File | null) => {
      onFileChange(selectedFile);
    },
    [onFileChange],
  );

  return (
    <div className="space-y-6">
      {/* File Upload Configuration */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">File Upload Configuration</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="select-bank" className="text-sm font-medium">
              Select Bank
            </label>
            <Select value={bank} onValueChange={(value) => onBankChange?.(value)}>
              <SelectTrigger id="select-bank">
                <SelectValue placeholder="Choose bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="icici">ICICI Bank</SelectItem>
                <SelectItem value="hdfc">HDFC Bank</SelectItem>
                <SelectItem value="sbi">State Bank of India</SelectItem>
                <SelectItem value="axis">Axis Bank</SelectItem>
                <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="custom-file-name" className="text-sm font-medium">
              Custom File Name
            </label>
            <Input
              id="custom-file-name"
              placeholder="Enter custom name for file"
              value={customFileName}
              onChange={(e) => onCustomFileNameChange?.(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      {!file && (
        <section
          aria-label="File upload drop zone"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          )}
        >
          {/* File Requirements Icon */}
          <div className="absolute right-4 top-4 z-10">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="sr-only">File requirements</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96" align="end">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    File Requirements
                  </h3>
                  <ul className="space-y-2 text-xs text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                      <span>
                        <strong>Required columns:</strong> Customer Name, Phone Number, Email,
                        Outstanding Amount, Bank, Settlements
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                      <span>Phone number must be 10 digits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                      <span>Outstanding amount must be ≤ ₹2,00,000</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                      <span>Settlement count must be ≤ 2</span>
                    </li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>{' '}
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div
              className={cn(
                'mb-4 rounded-full p-4 transition-colors',
                isDragging ? 'bg-primary/10' : 'bg-muted',
              )}
            >
              <Upload
                className={cn('h-10 w-10', isDragging ? 'text-primary' : 'text-muted-foreground')}
              />
            </div>
            <div className="mb-3">
              <p className="text-base font-semibold">
                {isDragging ? 'Drop your file here' : 'Upload Files'}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop your file here, or click to browse
              </p>
            </div>
            <Button type="button" variant="outline" size="lg" asChild>
              <label className="cursor-pointer">
                Select File
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      handleFileSelect(selectedFile);
                    }
                  }}
                />
              </label>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Supported formats: CSV, Excel (.xlsx, .xls) • Max 10MB
            </p>
          </div>
        </section>
      )}

      {/* File Preview */}
      {file && (
        <Card className="border-primary/50 bg-primary/5">
          <div className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{file.name}</p>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                  Uploaded
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
              </p>
            </div>

            <Button type="button" variant="ghost" size="sm" onClick={() => handleFileSelect(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card
            className={cn(
              'border-l-4',
              validationResult.isValid
                ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
            )}
          >
            <div className="flex items-start gap-3 p-4">
              {validationResult.isValid ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div className="flex-1 space-y-3">
                <p className="text-sm font-semibold">
                  {validationResult.isValid ? 'File Validated Successfully' : 'Validation Failed'}
                </p>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Total Rows</p>
                    <p className="font-semibold">{validationResult.totalRows}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valid Rows</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {validationResult.validRows}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invalid Rows</p>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {validationResult.invalidRows}
                    </p>
                  </div>
                </div>
                {validationResult.isValid && (
                  <div className="grid grid-cols-3 gap-4 border-t pt-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Total Loan Amount</p>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        ₹{(validationResult.totalLoanAmount || 1250000).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Settlement Count ≤ 2</p>
                      <p className="font-semibold text-purple-600 dark:text-purple-400">
                        {validationResult.settlementCountLessThan2 || validationResult.validRows}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Outstanding Amount</p>
                      <p className="font-semibold text-orange-600 dark:text-orange-400">
                        ₹
                        {(validationResult.totalOutstandingAmount || 980000).toLocaleString(
                          'en-IN',
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Missing Fields Warning */}
          {validationResult.missingFields && validationResult.missingFields.length > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                  Missing Required Fields
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  The following fields are missing from your file:{' '}
                  <span className="font-semibold">{validationResult.missingFields.join(', ')}</span>
                </p>
              </div>
            </div>
          )}

          {/* Error Details */}
          {validationResult.errors.length > 0 && (
            <Card>
              <div className="p-4">
                <h4 className="mb-3 text-sm font-semibold">
                  Validation Errors ({validationResult.errors.length})
                </h4>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {validationResult.errors.slice(0, 10).map((error) => (
                    <div
                      key={`${error.row}-${error.field}`}
                      className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-xs"
                    >
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">
                          Row {error.row} • {error.field}
                        </p>
                        <p className="text-muted-foreground">{error.message}</p>
                      </div>
                    </div>
                  ))}
                  {validationResult.errors.length > 10 && (
                    <p className="text-center text-xs text-muted-foreground">
                      + {validationResult.errors.length - 10} more errors
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
