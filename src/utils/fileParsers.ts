import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { logger } from './logger';
import { LogLevel } from '../types/logging';
import { PDFParser } from './pdfParser';

export interface ParsedData {
  [key: string]: string | number;
}

export interface ProcessedData {
  account_code: string;
  account_name: string;
  debit_balance: number;
  credit_balance: number;
}

export const parseExcelFile = async (file: File): Promise<ProcessedData[]> => {
  try {
    logger.log(LogLevel.INFO, 'Starting Excel file parsing', { fileName: file.name });
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Excel file contains no sheets');
    }

    const data: ProcessedData[] = [];
    let headerRow: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Process header row
        headerRow = row.values.slice(1).map(cell => String(cell).toLowerCase());
        return;
      }

      // Process data rows
      const rowData: ProcessedData = {
        account_code: '',
        account_name: '',
        debit_balance: 0,
        credit_balance: 0
      };

      row.eachCell((cell, colNumber) => {
        const header = headerRow[colNumber - 1];
        const value = cell.value;

        switch (header) {
          case 'account code':
          case 'код счета':
          case 'hisob raqami':
            rowData.account_code = String(value);
            break;
          case 'account name':
          case 'наименование счета':
          case 'hisob nomi':
            rowData.account_name = String(value);
            break;
          case 'debit':
          case 'debit balance':
          case 'дебет':
          case 'debet':
            rowData.debit_balance = typeof value === 'number' ? value : 0;
            break;
          case 'credit':
          case 'credit balance':
          case 'кредит':
          case 'kredit':
            rowData.credit_balance = typeof value === 'number' ? value : 0;
            break;
        }
      });

      if (rowData.account_code && rowData.account_name) {
        data.push(rowData);
      }
    });

    logger.log(LogLevel.INFO, 'Excel parsing completed successfully', { 
      fileName: file.name, 
      rowCount: data.length 
    });

    return data;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error parsing Excel file', { error });
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const parseCSV = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const data: ParsedData = {};
        results.data.forEach((row: any, rowIndex: number) => {
          Object.entries(row).forEach(([key, value]) => {
            if (key.trim() !== '') {
              data[`${key}_${rowIndex}`] = value;
            }
          });
        });
        logger.log(LogLevel.INFO, 'CSV parsing complete', { fileName: file.name, rowCount: results.data.length });
        resolve(data);
      },
      error: (error) => {
        logger.log(LogLevel.ERROR, 'Error parsing CSV', { fileName: file.name, error });
        reject(new Error(`Failed to parse CSV: ${error}`));
      },
    });
  });
};

export const parseXLSX = async (file: File): Promise<ParsedData> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet(1);
    const data: ParsedData = {};

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        const columnName = worksheet.getCell(1, colNumber).value?.toString() || `Column${colNumber}`;
        const key = `${columnName}_${rowNumber - 2}`; // Subtract 2 to start from 0 and account for header
        const value = cell.value;
        if (rowNumber > 1 && key.trim() !== '') { // Skip header row
          data[key] = typeof value === 'object' ? JSON.stringify(value) : value;
        }
      });
    });

    logger.log(LogLevel.INFO, 'XLSX parsing complete', { fileName: file.name, rowCount: worksheet.rowCount });
    return data;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error parsing XLSX', { fileName: file.name, error });
    throw new Error(`Failed to parse XLSX: ${error}`);
  }
};

export const parsePDF = async (file: File): Promise<ParsedData> => {
  return PDFParser.parse(file);
};