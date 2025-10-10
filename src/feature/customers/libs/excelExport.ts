import * as XLSX from 'xlsx';
import { Customer } from '../types/types';

/**
 * Export customers data to Excel file
 * @param customers - Array of customer data
 * @param filename - Optional filename (defaults to customers-export-{date}.xlsx)
 */
export const exportCustomersToExcel = (customers: Customer[], filename?: string) => {
  try {
    // Prepare data for Excel export
    const exportData = customers.map(customer => ({
      'Customer Name': customer.fullName,
      'Company': customer.company,
      'Email': customer.email || '',
      'Phone': customer.phone || '',
      'Status': customer.status,
      'Owner': customer.owner?.name || customer.owner?.email || 'Unknown',
      'Tags': Array.isArray(customer.tags) ? customer.tags.join(', ') : '',
      'Notes': customer.notes || '',
      'Created Date': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '',
      'Updated Date': customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : '',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Customer Name
      { wch: 20 }, // Company
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 12 }, // Status
      { wch: 15 }, // Owner
      { wch: 30 }, // Tags
      { wch: 40 }, // Notes
      { wch: 12 }, // Created Date
      { wch: 12 }, // Updated Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Generate filename if not provided
    const defaultFilename = `customers.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Successfully exported ${customers.length} customers to ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error exporting customers to Excel:', error);
    return {
      success: false,
      message: 'Failed to export customers to Excel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Export filtered customers data to Excel with custom columns
 * @param customers - Array of customer data
 * @param columns - Array of column keys to include in export
 * @param filename - Optional filename
 */
export const exportCustomersWithColumns = (
  customers: Customer[], 
  columns: (keyof Customer)[], 
  filename?: string
) => {
  try {
    // Column mapping for better headers
    const columnHeaders: Record<keyof Customer, string> = {
      id: 'ID',
      userId: 'User ID',
      fullName: 'Customer Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      status: 'Status',
      tags: 'Tags',
      notes: 'Notes',
      files: 'Files',
      ownerId: 'Owner ID',
      owner: 'Owner',
      createdAt: 'Created Date',
      updatedAt: 'Updated Date',
    };

    // Prepare data with selected columns only
    const exportData = customers.map(customer => {
      const row: Record<string, any> = {};
      
      columns.forEach(column => {
        const header = columnHeaders[column];
        let value = customer[column];

        // Format specific fields
        switch (column) {
          case 'owner':
            value = customer.owner?.name || customer.owner?.email || 'Unknown';
            break;
          case 'tags':
            value = Array.isArray(customer.tags) ? customer.tags.join(', ') : '';
            break;
          case 'createdAt':
          case 'updatedAt':
            value = value ? new Date(value as string).toLocaleDateString() : '';
            break;
          case 'files':
            value = customer.files ? 'Has attachments' : 'No attachments';
            break;
          default:
            value = value || '';
        }

        row[header] = value;
      });

      return row;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const columnWidths: { wch: number }[] = [];
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxWidth = 10;
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          maxWidth = Math.max(maxWidth, Math.min(cellLength, 50));
        }
      }
      columnWidths.push({ wch: maxWidth });
    }
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Generate filename if not provided
    const defaultFilename = `customers.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Successfully exported ${customers.length} customers with selected columns to ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error exporting customers with custom columns:', error);
    return {
      success: false,
      message: 'Failed to export customers to Excel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Export single customer data to Excel
 * @param customer - Single customer data
 * @param filename - Optional filename
 */
export const exportSingleCustomerToExcel = (customer: Customer, filename?: string) => {
  // Clean customer name for filename (remove special characters, replace spaces with hyphens)
  const cleanName = customer.fullName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  const defaultFilename = `${cleanName}-customer.xlsx`;
  return exportCustomersToExcel([customer], filename || defaultFilename);
};
