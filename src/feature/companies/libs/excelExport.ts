import * as XLSX from 'xlsx';
import { Company } from '../types/types';

/**
 * Export companies data to Excel file
 * @param companies - Array of company data
 * @param filename - Optional filename (defaults to companies.xlsx)
 */
export const exportCompaniesToExcel = (companies: Company[], filename?: string) => {
  try {
    // Prepare data for Excel export
    const exportData = companies.map(company => ({
      'Company Name': company.fullName || '',
      'Industry': company.industry || '',
      'Website': company.website || '',
      'Email': company.email || '',
      'Phone': company.phone || '',
      'Status': company.status || '',
      'Owner': company.owner?.name || company.owner?.email || 'Unknown',
      'Tags': company.tags || '',
      'Last Contact': company.lastContact ? new Date(company.lastContact).toLocaleDateString() : '',
      'Created Date': company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '',
      'Updated Date': company.updatedAt ? new Date(company.updatedAt).toLocaleDateString() : '',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Company Name
      { wch: 20 }, // Industry
      { wch: 30 }, // Website
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 12 }, // Status
      { wch: 15 }, // Owner
      { wch: 30 }, // Tags
      { wch: 12 }, // Last Contact
      { wch: 12 }, // Created Date
      { wch: 12 }, // Updated Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');

    // Generate filename if not provided
    const defaultFilename = `companies.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Successfully exported ${companies.length} companies to ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error exporting companies to Excel:', error);
    return {
      success: false,
      message: 'Failed to export companies to Excel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Export filtered companies data to Excel with custom columns
 * @param companies - Array of company data
 * @param columns - Array of column keys to include in export
 * @param filename - Optional filename
 */
export const exportCompaniesWithColumns = (
  companies: Company[], 
  columns: (keyof Company)[], 
  filename?: string
) => {
  try {
    // Column mapping for better headers
    const columnHeaders: Record<keyof Company, string> = {
      id: 'ID',
      industry: 'Industry',
      website: 'Website',
      fullName: 'Company Name',
      email: 'Email',
      phone: 'Phone',
      owner: 'Owner',
      ownerAvatar: 'Owner Avatar',
      status: 'Status',
      lastContact: 'Last Contact',
      tags: 'Tags',
      createdAt: 'Created Date',
      updatedAt: 'Updated Date',
    };

    // Prepare data with selected columns only
    const exportData = companies.map(company => {
      const row: Record<string, any> = {};
      
      columns.forEach(column => {
        const header = columnHeaders[column];
        let value = company[column];

        // Format specific fields
        switch (column) {
          case 'owner':
            value = company.owner?.name || company.owner?.email || 'Unknown';
            break;
          case 'createdAt':
          case 'updatedAt':
          case 'lastContact':
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');

    // Generate filename if not provided
    const defaultFilename = `companies.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      message: `Successfully exported ${companies.length} companies with selected columns to ${finalFilename}`,
      filename: finalFilename,
    };
  } catch (error) {
    console.error('Error exporting companies with custom columns:', error);
    return {
      success: false,
      message: 'Failed to export companies to Excel',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Export single company data to Excel
 * @param company - Single company data
 * @param filename - Optional filename
 */
export const exportSingleCompanyToExcel = (company: Company, filename?: string) => {
  // Clean company name for filename (remove special characters, replace spaces with hyphens)
  const cleanName = (company.fullName || 'company').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  const defaultFilename = `${cleanName}-company.xlsx`;
  return exportCompaniesToExcel([company], filename || defaultFilename);
};
