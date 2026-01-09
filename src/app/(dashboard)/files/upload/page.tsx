'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BorrowersFileUpload } from '@/features/campaigns/components/borrowers-file-upload';
import type { FileValidationResult } from '@/features/campaigns/lib/validation';

const CampaignFilesUploadPage = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [bank, setBank] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileChange = async (newFile: File | null) => {
    setFile(newFile);
    setValidationResult(null);

    if (newFile) {
      setIsValidating(true);
      // Simulate validation - replace with actual validation later
      setTimeout(() => {
        setValidationResult({
          isValid: true,
          totalRows: 100,
          validRows: 100,
          invalidRows: 0,
          errors: [],
        });
        setIsValidating(false);
      }, 1000);
    }
  };

  const handleSubmit = () => {
    // TODO: Handle file upload submission
    router.push('/campaigns/files');
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Upload File</h1>
        <p className="text-muted-foreground">Upload a new borrower file for your campaigns</p>
      </div>

      {/* Form Content */}
      <Card className="shadow-md">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-2xl">File Upload</CardTitle>
          <CardDescription>
            Upload a CSV or Excel file containing your borrowers data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <BorrowersFileUpload
              file={file}
              onFileChange={handleFileChange}
              validationResult={validationResult}
              bank={bank}
              onBankChange={setBank}
              customFileName={customFileName}
              onCustomFileNameChange={setCustomFileName}
            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/campaigns/files')}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!file || !validationResult?.isValid || isValidating}
                className="min-w-35"
              >
                Create File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignFilesUploadPage;
