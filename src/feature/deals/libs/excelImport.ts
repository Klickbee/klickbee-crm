import * as XLSX from 'xlsx';
import { Deal } from '../types';

/**
 * Import deals from Excel file
 */
export const importDealsFromExcel = async (file: File): Promise<{
  success: boolean;
  message: string;
  data?: Partial<Deal>[];
  errors?: string[];
}> => {
  try {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      return { success: false, message: 'Please select a valid Excel file (.xlsx or .xls)' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheetName = workbook.SheetNames[0];
    
    if (!worksheetName) {
      return { success: false, message: 'No worksheets found in the Excel file' };
    }
    
    const worksheet = workbook.Sheets[worksheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (jsonData.length < 2) {
      return { success: false, message: 'Excel file must contain at least a header row and one data row' };
    }
    
    const headers = jsonData[0] as string[];
    const normalizedHeaders = headers.map(h => h?.toString().toLowerCase().trim());
    
    const columnMappings: Record<string, keyof Deal> = {
      'deal name': 'dealName',
      'name': 'dealName',
      'company': 'company',
      'contact': 'contact',
      'stage': 'stage',
      'amount': 'amount',
      'owner': 'owner',
      'activity': 'activity',
      'tags': 'tags',
      'close date': 'closeDate',
      'priority': 'priority',
      'notes': 'notes',
    };

    const fieldMappings: Record<number, keyof Deal> = {};
    normalizedHeaders.forEach((header, index) => {
      const field = columnMappings[header];
      if (field) fieldMappings[index] = field;
    });
    
    const requiredFields: (keyof Deal)[] = ['dealName'];
    const mappedFields = Object.values(fieldMappings);
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      return {
        success: false,
        message: `Missing required columns: Deal Name. Please ensure your Excel file has a column for Deal Name`,
      };
    }
    
    const deals: Partial<Deal>[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.every(cell => !cell)) continue;
      
      const deal: Partial<Deal> = {};
      let hasValidData = false;
      
      Object.entries(fieldMappings).forEach(([colIndex, field]) => {
        const cellValue = row[parseInt(colIndex)];
        if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
          hasValidData = true;
          
          switch (field) {
            case 'stage':
              const validStages = ['New', 'Contacted', 'Proposal', 'Won', 'Lost'];
              const stage = cellValue.toString().trim();
              if (validStages.includes(stage)) {
                deal[field] = stage as Deal['stage'];
              } else {
                deal[field] = 'New';
                errors.push(`Row ${i + 1}: Invalid stage '${stage}', defaulted to 'New'`);
              }
              break;
            case 'amount':
              const amount = parseFloat(cellValue.toString().replace(/[^0-9.-]/g, ''));
              if (!isNaN(amount)) {
                deal[field] = amount;
              } else {
                deal[field] = 0;
                errors.push(`Row ${i + 1}: Invalid amount '${cellValue}', defaulted to 0`);
              }
              break;
            case 'closeDate':
              const dateValue = cellValue.toString().trim();
              if (dateValue) {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                  deal[field] = date.toISOString().split('T')[0];
                } else {
                  errors.push(`Row ${i + 1}: Invalid date format '${dateValue}'`);
                }
              }
              break;
            default:
              deal[field] = cellValue.toString().trim();
          }
        }
      });
      
      if (hasValidData && deal.dealName) {
        deals.push(deal);
      } else if (hasValidData) {
        errors.push(`Row ${i + 1}: Missing required field 'Deal Name'`);
      }
    }
    
    if (deals.length === 0) {
      return { success: false, message: 'No valid deal data found in the Excel file', errors };
    }
    
    return {
      success: true,
      message: `Successfully processed ${deals.length} deals from Excel file`,
      data: deals,
      errors: errors.length > 0 ? errors : undefined,
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Failed to import deals from Excel file',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Generate a sample Excel template for deal import
 */
export const generateDealImportTemplate = (filename?: string) => {
  try {
    const templateData = [
      {
        'Deal Name': 'Enterprise Software License',
        'Company': 'Acme Corp',
        'Contact': 'John Smith',
        'Stage': 'Proposal',
        'Amount': 50000,
        'Owner': 'Sales Rep',
        'Activity': 'Proposal sent',
        'Tags': 'Enterprise, Software',
        'Close Date': '2024-02-15',
        'Priority': 'High',
        'Notes': 'Large enterprise deal with good potential',
      }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    const columnWidths = [
      { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 40 }
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deal Template');
    const finalFilename = filename || 'deal-import-template.xlsx';
    XLSX.writeFile(workbook, finalFilename);

    return { success: true, message: `Deal import template downloaded as ${finalFilename}`, filename: finalFilename };
  } catch (error) {
    return { success: false, message: 'Failed to generate deal import template' };
  }
};
