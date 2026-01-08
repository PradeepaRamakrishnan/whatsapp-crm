import type { FileValidationResult } from './validation';

// Mock function to simulate file validation
// In production, this would parse the CSV/Excel and validate each row
export async function validateBorrowersFile(file: File): Promise<FileValidationResult> {
  // Simulate async validation delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock validation result based on file name or size
  const fileName = file.name.toLowerCase();

  // Simulate a file with errors
  if (fileName.includes('error') || fileName.includes('invalid')) {
    return {
      isValid: false,
      totalRows: 150,
      validRows: 132,
      invalidRows: 18,
      missingFields: ['phone', 'email'],
      errors: [
        { row: 5, field: 'phone', message: 'Invalid phone number format' },
        { row: 12, field: 'email', message: 'Email is required' },
        { row: 23, field: 'aadhar', message: 'Aadhar number must be 12 digits' },
        { row: 34, field: 'pan', message: 'Invalid PAN format' },
        { row: 45, field: 'name', message: 'Name is required' },
        { row: 56, field: 'address', message: 'Address is too short' },
        { row: 67, field: 'phone', message: 'Phone number already exists' },
        { row: 78, field: 'email', message: 'Invalid email format' },
        { row: 89, field: 'loan_amount', message: 'Loan amount must be a positive number' },
        { row: 92, field: 'tenure', message: 'Tenure must be between 6-60 months' },
        { row: 103, field: 'phone', message: 'Invalid phone number format' },
        { row: 115, field: 'aadhar', message: 'Aadhar number is required' },
      ],
    };
  }

  // Simulate a file with missing fields
  if (fileName.includes('missing')) {
    return {
      isValid: false,
      totalRows: 100,
      validRows: 0,
      invalidRows: 100,
      missingFields: ['name', 'phone', 'loan_amount'],
      errors: [],
    };
  }

  // Simulate a valid file
  return {
    isValid: true,
    totalRows: 125,
    validRows: 125,
    invalidRows: 0,
    errors: [],
  };
}
