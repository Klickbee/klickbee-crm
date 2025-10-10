import * as XLSX from 'xlsx';
import { Deal } from '../types';

/**
 * Export deals data to Excel file
 * @param deals - Array of deal data
 * @param filename - Optional filename (defaults to deals.xlsx)
 */
export const exportDealsToExcel = (deals: Deal[], filename?: string) => {
  try {
    // Prepare data for Excel export
    const exportData = deals.map(deal => ({
      'Deal Name': deal.dealName || '',
      'Company': deal.company || '',
      'Contact': deal.contact || '',
      'Stage': deal.stage || '',
      'Amount': deal.amount ? `$${deal.amount.toLocaleString()}` : '$0',
      'Owner': deal.owner || 'Unknown',
      'Activity': deal.activity || '',
      'Tags': deal.tags || '',
      'Close Date': deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : '',
      'Priority': deal.priority || '',
      'Notes': deal.notes || '',
      'Attachments': Array.isArray(deal.attachments) ? deal.attachments.join(', ') : deal.attachments || '',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Deal Name
      { wch: 20 }, // Company
      { wch: 20 }, // Contact
      { wch: 15 }, // Stage
      { wch: 15 }, // Amount
      { wch: 15 }, // Owner
      { wch: 20 }, // Activity
      { wch: 30 }, // Tags
      { wch: 12 }, // Close Date
      { wch: 12 }, // Priority
      { wch: 40 }, // Notes
      { wch: 30 }, // Attachments
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deals');

    // Generate filename if not provided
    const defaultFilename = `deals.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Successfully exported ${deals.length} deals to ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error exporting deals to Excel:', error);
    return {
      success: false,
      message: 'Failed to export deals to Excel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Export filtered deals data to Excel with custom columns
 * @param deals - Array of deal data
 * @param columns - Array of column keys to include in export
 * @param filename - Optional filename
 */
export const exportDealsWithColumns = (
  deals: Deal[], 
  columns: (keyof Deal)[], 
  filename?: string
) => {
  try {
    // Column mapping for better headers
    const columnHeaders: Record<keyof Deal, string> = {
      id: 'ID',
      dealName: 'Deal Name',
      company: 'Company',
      contact: 'Contact',
      stage: 'Stage',
      amount: 'Amount',
      owner: 'Owner',
      ownerImage: 'Owner Image',
      activity: 'Activity',
      tags: 'Tags',
      closeDate: 'Close Date',
      priority: 'Priority',
      notes: 'Notes',
      attachments: 'Attachments',
    };

    // Prepare data with selected columns only
    const exportData = deals.map(deal => {
      const row: Record<string, any> = {};
      
      columns.forEach(column => {
        const header = columnHeaders[column];
        let value = deal[column];

        // Format specific fields
        switch (column) {
          case 'amount':
            value = deal.amount ? `$${deal.amount.toLocaleString()}` : '$0';
            break;
          case 'closeDate':
            value = value ? new Date(value as string).toLocaleDateString() : '';
            break;
          case 'attachments':
            value = Array.isArray(deal.attachments) ? deal.attachments.join(', ') : deal.attachments || '';
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deals');

    // Generate filename if not provided
    const defaultFilename = `deals.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Successfully exported ${deals.length} deals with selected columns to ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error exporting deals with custom columns:', error);
    return {
      success: false,
      message: 'Failed to export deals to Excel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Export single deal data to Excel
 * @param deal - Single deal data
 * @param filename - Optional filename
 */
export const exportSingleDealToExcel = (deal: Deal, filename?: string) => {
  // Clean deal name for filename (remove special characters, replace spaces with hyphens)
  const cleanName = (deal.dealName || 'deal').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  const defaultFilename = `${cleanName}-deal.xlsx`;
  return exportDealsToExcel([deal], filename || defaultFilename);
};
