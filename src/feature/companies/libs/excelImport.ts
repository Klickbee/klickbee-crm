import * as XLSX from 'xlsx';
import { Company } from '../types/types';

/**
 * Import companies from Excel file
 * @param file - Excel file to import
 * @returns Promise with import results
 */
export const importCompaniesFromExcel = async (file: File): Promise<{
  success: boolean;
  message: string;
  data?: Partial<Company>[];
  errors?: string[];
}> => {
  try {
    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      return {
        success: false,
        message: 'Please select a valid Excel file (.xlsx or .xls)',
      };
    }

    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const worksheetName = workbook.SheetNames[0];
    if (!worksheetName) {
      return {
        success: false,
        message: 'No worksheets found in the Excel file',
      };
    }
    
    const worksheet = workbook.Sheets[worksheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (jsonData.length < 2) {
      return {
        success: false,
        message: 'Excel file must contain at least a header row and one data row',
      };
    }
    
    // Get headers and normalize them
    const headers = jsonData[0] as string[];
    const normalizedHeaders = headers.map(h => h?.toString().toLowerCase().trim() || '');
    
    // Define expected column mappings (flexible to handle different header names)
    const columnMappings: Record<string, keyof Company> = {
      'company name': 'fullName',
      'full name': 'fullName',
      'name': 'fullName',
      'industry': 'industry',
      'website': 'website',
      'email': 'email',
      'phone': 'phone',
      'status': 'status',
      'tags': 'tags',
      'last contact': 'lastContact',
      'owner': 'owner',
    };

    
    // Map headers to Company fields
    const fieldMappings: Record<number, keyof Company> = {};
    normalizedHeaders.forEach((header, index) => {
      const field = columnMappings[header];
      if (field) {
        fieldMappings[index] = field;
      }
    });
    
    
    // Check if we have required fields
    const requiredFields: (keyof Company)[] = ['fullName'];
    const mappedFields = Object.values(fieldMappings);
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      return {
        success: false,
        message: `Missing required columns: ${missingRequired.join(', ')}. Please ensure your Excel file has a column for Company Name (or Full Name/Name)`,
      };
    }
    
    // Process data rows
    const companies: Partial<Company>[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.every(cell => !cell)) continue; // Skip empty rows
      
      const company: Partial<Company> = {};
      let hasValidData = false;
      
      // Map row data to company fields
      Object.entries(fieldMappings).forEach(([colIndex, field]) => {
        const cellValue = row[parseInt(colIndex)];
        if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
          hasValidData = true;
          
          // Handle different field types
          switch (field) {
            case 'tags':
              // Handle tags as comma-separated string (keep as string for now, will be converted in store)
              company[field] = cellValue.toString().trim();
              break;
            case 'status':
              // Validate status values based on Company type
              const validStatuses = ['Active', 'Follow Up', 'inactive'];
              const status = cellValue.toString().trim();
              if (validStatuses.includes(status)) {
                company[field] = status as Company['status'];
              } else {
                company[field] = 'Active'; // Default status
                errors.push(`Row ${i + 1}: Invalid status '${status}', defaulted to 'Active'. Valid values: ${validStatuses.join(', ')}`);
              }
              break;
            case 'email':
              // Basic email validation
              const email = cellValue.toString().trim();
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(email)) {
                company[field] = email;
              } else {
                errors.push(`Row ${i + 1}: Invalid email format '${email}'`);
              }
              break;
            case 'lastContact':
              // Handle date fields
              const dateValue = cellValue.toString().trim();
              if (dateValue) {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                  company[field] = date.toISOString();
                } else {
                  errors.push(`Row ${i + 1}: Invalid date format '${dateValue}'`);
                }
              }
              break;
            default:
              company[field] = cellValue.toString().trim();
          }
        }
      });
      
      // Only add company if it has valid data and required fields
      if (hasValidData && company.fullName) {
        companies.push(company);
      } else if (hasValidData) {
        errors.push(`Row ${i + 1}: Missing required field 'Company Name'`);
      }
    }
    
    if (companies.length === 0) {
      return {
        success: false,
        message: 'No valid company data found in the Excel file',
        errors,
      };
    }
    
    return {
      success: true,
      message: `Successfully processed ${companies.length} companies from Excel file`,
      data: companies,
      errors: errors.length > 0 ? errors : undefined,
    };
    
  } catch (error) {
    console.error('Error importing companies from Excel:', error);
    return {
      success: false,
      message: 'Failed to import companies from Excel file',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Generate a sample Excel template for company import
 * @param filename - Optional filename for the template
 */
export const generateCompanyImportTemplate = (filename?: string) => {
  try {
    // Define sample data with proper headers
    const templateData = [
      {
        'Company Name': 'Acme Corporation',
        'Industry': 'Technology',
        'Website': 'https://acme.com',
        'Email': 'contact@acme.com',
        'Phone': '+1-555-0123',
        'Status': 'Active',
        'Tags': 'Enterprise, Technology',
        'Last Contact': '2024-01-15',
      },
      {
        'Company Name': 'Tech Solutions Inc',
        'Industry': 'Software Development',
        'Website': 'https://techsolutions.com',
        'Email': 'info@techsolutions.com',
        'Phone': '+1-555-0456',
        'Status': 'Follow Up',
        'Tags': 'Prospect, Software',
        'Last Contact': '2024-01-10',
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Company Name
      { wch: 20 }, // Industry
      { wch: 30 }, // Website
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 12 }, // Status
      { wch: 30 }, // Tags
      { wch: 12 }, // Last Contact
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Company Template');

    // Generate filename if not provided
    const defaultFilename = 'company-import-template.xlsx';
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Company import template downloaded as ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error generating company import template:', error);
    return {
      success: false,
      message: 'Failed to generate company import template',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
