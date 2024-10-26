import * as XLSX from 'xlsx';
import { ProcessedData } from '../types';
import { logger } from '../../../utils/logger';
import { LogLevel } from '../../../types/logging';

export const processExcelData = (buffer: ArrayBuffer): ProcessedData[] => {
  try {
    logger.log(LogLevel.INFO, 'Starting Excel processing...');
    
    // Read the Excel file with proper options
    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      raw: true // Important: Get raw values instead of formatted strings
    });
    
    if (!workbook.SheetNames.length) {
      logger.log(LogLevel.ERROR, 'No sheets found in workbook');
      return [];
    }

    // Get first sheet
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to array of objects with raw values
    const rawData = XLSX.utils.sheet_to_json(firstSheet, {
      raw: true, // Get raw values
      defval: 0, // Default value for empty cells
      blankrows: false
    });

    if (!rawData.length) {
      logger.log(LogLevel.ERROR, 'No data found in sheet');
      return [];
    }

    // Process each row
    const processedData: ProcessedData[] = rawData.map((row: any) => {
      // Helper function to find value using multiple possible key patterns
      const findValue = (patterns: string[]): any => {
        const key = Object.keys(row).find(k => 
          patterns.some(p => k.toLowerCase().includes(p.toLowerCase()))
        );
        return key ? row[key] : null;
      };

      // Get values using various possible column names
      const code = findValue(['code', 'счет', 'raqam', 'account', 'код']);
      const name = findValue(['name', 'наим', 'nom', 'description']);
      const debit = findValue(['debit', 'дебет', 'debet', 'dt']);
      const credit = findValue(['credit', 'кредит', 'kredit', 'cr']);

      // Parse numeric values
      const parseNumber = (value: any): number => {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        // Remove any non-numeric characters except decimal point and minus
        const cleaned = String(value).replace(/[^\d.-]/g, '');
        return cleaned ? parseFloat(cleaned) : 0;
      };

      return {
        account_code: String(code || '').trim(),
        account_name: String(name || '').trim(),
        debit_balance: parseNumber(debit),
        credit_balance: parseNumber(credit)
      };
    }).filter(item => 
      // Filter out rows without account code or name
      item.account_code || item.account_name
    );

    logger.log(LogLevel.INFO, `Successfully processed ${processedData.length} rows`);
    return processedData;

  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error processing Excel file', { error });
    throw new Error('Failed to process Excel file');
  }
};