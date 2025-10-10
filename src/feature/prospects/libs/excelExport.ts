import * as XLSX from 'xlsx';
import { Prospect } from '../types/types';

/**
 * Export prospects data to Excel file
 * @param prospects - Array of prospect data
 * @param filename - Optional filename (defaults to prospects.xlsx)
 */
export const exportProspectsToExcel = (prospects: Prospect[], filename?: string) => {
  try {
    // Prepare data for Excel export
    const exportData = prospects.map(prospect => ({
      'Prospect Name': prospect.fullName || '',
      'Company': prospect.company || '',
      'Email': prospect.email || '',
      'Phone': prospect.phone || '',
      'Status': prospect.status || '',
      'Owner': typeof prospect.owner === 'object' && prospect.owner 
        ? (prospect.owner.name || prospect.owner.email) 
        : prospect.owner || 'Unknown',
      'Tags': Array.isArray(prospect.tags) ? prospect.tags.join(', ') : prospect.tags || '',
      'Notes': prospect.notes || '',
      'Created Date': prospect.createdAt ? new Date(prospect.createdAt).toLocaleDateString() : '',
      'Updated Date': prospect.updatedAt ? new Date(prospect.updatedAt).toLocaleDateString() : '',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Prospect Name
      { wch: 20 }, // Company
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Status
      { wch: 15 }, // Owner
      { wch: 30 }, // Tags
      { wch: 40 }, // Notes
      { wch: 12 }, // Created Date
      { wch: 12 }, // Updated Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospects');

    // Generate filename if not provided
    const defaultFilename = `prospects.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Successfully exported ${prospects.length} prospects to ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error exporting prospects to Excel:', error);
    return {
      success: false,
      message: 'Failed to export prospects to Excel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Export filtered prospects data to Excel with custom columns
 * @param prospects - Array of prospect data
 * @param columns - Array of column keys to include in export
 * @param filename - Optional filename
 */
export const exportProspectsWithColumns = (
  prospects: Prospect[], 
  columns: (keyof Prospect)[], 
  filename?: string
) => {
  try {
    // Column mapping for better headers
    const columnHeaders: Record<keyof Prospect, string> = {
      id: 'ID',
      fullName: 'Prospect Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      status: 'Status',
      tags: 'Tags',
      notes: 'Notes',
      ownerId: 'Owner ID',
      userId: 'User ID',
      owner: 'Owner',
      ownerAvatar: 'Owner Avatar',
      createdAt: 'Created Date',
      updatedAt: 'Updated Date',
    };

    // Prepare data with selected columns only
    const exportData = prospects.map(prospect => {
      const row: Record<string, any> = {};
      
      columns.forEach(column => {
        const header = columnHeaders[column];
        let value = prospect[column];

        // Format specific fields
        switch (column) {
          case 'owner':
            value = typeof prospect.owner === 'object' && prospect.owner 
              ? (prospect.owner.name || prospect.owner.email) 
              : prospect.owner || 'Unknown';
            break;
          case 'tags':
            value = Array.isArray(prospect.tags) ? prospect.tags.join(', ') : prospect.tags || '';
            break;
          case 'createdAt':
          case 'updatedAt':
            value = value ? new Date(value as string).toLocaleDateString() : '';
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospects');

    // Generate filename if not provided
    const defaultFilename = `prospects.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Successfully exported ${prospects.length} prospects with selected columns to ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error exporting prospects with custom columns:', error);
    return {
      success: false,
      message: 'Failed to export prospects to Excel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Export single prospect data to Excel
 * @param prospect - Single prospect data
 * @param filename - Optional filename
 */
export const exportSingleProspectToExcel = (prospect: Prospect, filename?: string) => {
  // Clean prospect name for filename (remove special characters, replace spaces with hyphens)
  const cleanName = (prospect.fullName || 'prospect').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  const defaultFilename = `${cleanName}-prospect.xlsx`;
  return exportProspectsToExcel([prospect], filename || defaultFilename);
};
