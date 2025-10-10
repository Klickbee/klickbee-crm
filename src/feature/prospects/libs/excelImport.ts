import * as XLSX from 'xlsx';
import { Prospect } from '../types/types';

/**
 * Import prospects from Excel file
 * @param file - Excel file to import
 * @returns Promise with import results
 */
export const importProspectsFromExcel = async (file: File): Promise<{
  success: boolean;
  message: string;
  data?: Partial<Prospect>[];
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
    const columnMappings: Record<string, keyof Prospect> = {
      'prospect name': 'fullName',
      'full name': 'fullName',
      'name': 'fullName',
      'company': 'company',
      'email': 'email',
      'phone': 'phone',
      'status': 'status',
      'tags': 'tags',
      'notes': 'notes',
    };

    console.log('Available headers:', headers);
    console.log('Normalized headers:', normalizedHeaders);
    
    // Map headers to Prospect fields
    const fieldMappings: Record<number, keyof Prospect> = {};
    normalizedHeaders.forEach((header, index) => {
      const field = columnMappings[header];
      if (field) {
        fieldMappings[index] = field;
      }
    });
    
    console.log('Column mappings found:', fieldMappings);
    
    // Check if we have required fields
    const requiredFields: (keyof Prospect)[] = ['fullName'];
    const mappedFields = Object.values(fieldMappings);
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      return {
        success: false,
        message: `Missing required columns: ${missingRequired.join(', ')}. Please ensure your Excel file has a column for Prospect Name (or Full Name/Name)`,
      };
    }
    
    // Process data rows
    const prospects: Partial<Prospect>[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.every(cell => !cell)) continue; // Skip empty rows
      
      const prospect: Partial<Prospect> = {};
      let hasValidData = false;
      
      // Map row data to prospect fields
      Object.entries(fieldMappings).forEach(([colIndex, field]) => {
        const cellValue = row[parseInt(colIndex)];
        if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
          hasValidData = true;
          
          // Handle different field types
          switch (field) {
            case 'tags':
              // Handle tags as array (convert from comma-separated string)
              const tagsString = cellValue.toString().trim();
              prospect[field] = tagsString ? tagsString.split(',').map((tag: string) => tag.trim()) : [];
              break;
            case 'status':
              // Validate status values based on Prospect type
              const validStatuses = ['New', 'Cold', 'Qualified', 'Warmlead', 'Converted', 'Notintrested'];
              const status = cellValue.toString().trim();
              if (validStatuses.includes(status)) {
                prospect[field] = status as Prospect['status'];
              } else {
                prospect[field] = 'New'; // Default status
                errors.push(`Row ${i + 1}: Invalid status '${status}', defaulted to 'New'. Valid values: ${validStatuses.join(', ')}`);
              }
              break;
            case 'email':
              // Basic email validation
              const email = cellValue.toString().trim();
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(email)) {
                prospect[field] = email;
              } else {
                errors.push(`Row ${i + 1}: Invalid email format '${email}'`);
              }
              break;
            default:
              prospect[field] = cellValue.toString().trim();
          }
        }
      });
      
      // Only add prospect if it has valid data and required fields
      if (hasValidData && prospect.fullName) {
        console.log(`Row ${i + 1} processed:`, prospect);
        prospects.push(prospect);
      } else if (hasValidData) {
        errors.push(`Row ${i + 1}: Missing required field 'Prospect Name'`);
        console.log(`Row ${i + 1} skipped - missing fullName:`, prospect);
      }
    }
    
    if (prospects.length === 0) {
      return {
        success: false,
        message: 'No valid prospect data found in the Excel file',
        errors,
      };
    }
    
    return {
      success: true,
      message: `Successfully processed ${prospects.length} prospects from Excel file`,
      data: prospects,
      errors: errors.length > 0 ? errors : undefined,
    };
    
  } catch (error) {
    console.error('Error importing prospects from Excel:', error);
    return {
      success: false,
      message: 'Failed to import prospects from Excel file',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Generate a sample Excel template for prospect import
 * @param filename - Optional filename for the template
 */
export const generateProspectImportTemplate = (filename?: string) => {
  try {
    // Define sample data with proper headers
    const templateData = [
      {
        'Prospect Name': 'John Smith',
        'Company': 'ABC Industries',
        'Email': 'john.smith@abc.com',
        'Phone': '+1-555-0123',
        'Status': 'New',
        'Tags': 'Enterprise, Technology',
        'Notes': 'Interested in our premium package',
      },
      {
        'Prospect Name': 'Sarah Johnson',
        'Company': 'XYZ Corp',
        'Email': 'sarah.johnson@xyz.com',
        'Phone': '+1-555-0456',
        'Status': 'Qualified',
        'Tags': 'SMB, Healthcare',
        'Notes': 'Ready to move forward with proposal',
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Prospect Name
      { wch: 20 }, // Company
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Status
      { wch: 30 }, // Tags
      { wch: 40 }, // Notes
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospect Template');

    // Generate filename if not provided
    const defaultFilename = 'prospect-import-template.xlsx';
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Prospect import template downloaded as ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error generating prospect import template:', error);
    return {
      success: false,
      message: 'Failed to generate prospect import template',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
