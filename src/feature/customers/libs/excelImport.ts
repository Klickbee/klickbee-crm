import * as XLSX from 'xlsx';
import { Customer } from '../types/types';

/**
 * Import customers from Excel file
 * @param file - Excel file to import
 * @returns Promise with import results
 */
export const importCustomersFromExcel = async (file: File): Promise<{
  success: boolean;
  message: string;
  data?: Partial<Customer>[];
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
    const normalizedHeaders = headers.map(h => h?.toString().toLowerCase().trim());
    
    // Define expected column mappings (flexible to handle different header names)
    const columnMappings: Record<string, keyof Customer> = {
      'customer name': 'fullName',
      'full name': 'fullName',
      'name': 'fullName',
      'company': 'company',
      'email': 'email',
      'phone': 'phone',
      'status': 'status',
      'tags': 'tags',
      'notes': 'notes',
      'owner': 'owner',
    };

    console.log('Available headers:', headers);
    console.log('Normalized headers:', normalizedHeaders);
    
    // Map headers to Customer fields
    const fieldMappings: Record<number, keyof Customer> = {};
    normalizedHeaders.forEach((header, index) => {
      const field = columnMappings[header];
      if (field) {
        fieldMappings[index] = field;
      }
    });
    
    console.log('Column mappings found:', fieldMappings);
    
    // Check if we have required fields
    const requiredFields: (keyof Customer)[] = ['fullName'];
    const mappedFields = Object.values(fieldMappings);
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      return {
        success: false,
        message: `Missing required columns: ${missingRequired.join(', ')}. Please ensure your Excel file has a column for Customer Name (or Full Name/Name)`,
      };
    }
    
    // Process data rows
    const customers: Partial<Customer>[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.every(cell => !cell)) continue; // Skip empty rows
      
      const customer: Partial<Customer> = {};
      let hasValidData = false;
      
      // Map row data to customer fields
      Object.entries(fieldMappings).forEach(([colIndex, field]) => {
        const cellValue = row[parseInt(colIndex)];
        if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
          hasValidData = true;
          
          // Handle different field types
          switch (field) {
            case 'tags':
              // Handle tags as comma-separated string (keep as string for now, will be converted to array in store)
              customer[field] = cellValue.toString().trim();
              break;
            case 'status':
              // Validate status values based on Customer type
              const validStatuses = ['Active', 'FollowUp', 'inactive'];
              const status = cellValue.toString().trim();
              if (validStatuses.includes(status)) {
                customer[field] = status as Customer['status'];
              } else {
                customer[field] = 'Active'; // Default status
                errors.push(`Row ${i + 1}: Invalid status '${status}', defaulted to 'Active'. Valid values: ${validStatuses.join(', ')}`);
              }
              break;
            case 'email':
              // Basic email validation
              const email = cellValue.toString().trim();
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(email)) {
                customer[field] = email;
              } else {
                errors.push(`Row ${i + 1}: Invalid email format '${email}'`);
              }
              break;
            default:
              customer[field] = cellValue.toString().trim();
          }
        }
      });
      
      // Only add customer if it has valid data and required fields
      if (hasValidData && customer.fullName) {
        console.log(`Row ${i + 1} processed:`, customer);
        customers.push(customer);
      } else if (hasValidData) {
        errors.push(`Row ${i + 1}: Missing required field 'Customer Name'`);
        console.log(`Row ${i + 1} skipped - missing fullName:`, customer);
      }
    }
    
    if (customers.length === 0) {
      return {
        success: false,
        message: 'No valid customer data found in the Excel file',
        errors,
      };
    }
    
    return {
      success: true,
      message: `Successfully processed ${customers.length} customers from Excel file`,
      data: customers,
      errors: errors.length > 0 ? errors : undefined,
    };
    
  } catch (error) {
    console.error('Error importing customers from Excel:', error);
    return {
      success: false,
      message: 'Failed to import customers from Excel file',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Generate a sample Excel template for customer import
 * @param filename - Optional filename for the template
 */
export const generateCustomerImportTemplate = (filename?: string) => {
  try {
    // Define sample data with proper headers
    const templateData = [
      {
        'Customer Name': 'John Doe',
        'Company': 'Acme Corp',
        'Email': 'john.doe@acme.com',
        'Phone': '+1-555-0123',
        'Status': 'Active',
        'Tags': 'VIP, Enterprise',
        'Notes': 'Important client with high value deals',
      },
      {
        'Customer Name': 'Jane Smith',
        'Company': 'Tech Solutions Inc',
        'Email': 'jane.smith@techsolutions.com',
        'Phone': '+1-555-0456',
        'Status': 'FollowUp',
        'Tags': 'Prospect, Technology',
        'Notes': 'Interested in our premium services',
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Customer Name
      { wch: 20 }, // Company
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 12 }, // Status
      { wch: 30 }, // Tags
      { wch: 40 }, // Notes
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Template');

    // Generate filename if not provided
    const defaultFilename = 'customer-import-template.xlsx';
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Customer import template downloaded as ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error generating customer import template:', error);
    return {
      success: false,
      message: 'Failed to generate customer import template',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
