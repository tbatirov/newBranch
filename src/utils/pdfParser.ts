import { ParsedData } from './fileParsers';
import { logger } from './logger';
import { LogLevel } from '../types/logging';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface TableData {
  headers: string[];
  rows: string[][];
}

export class PDFParser {
  private static isNumeric(str: string): boolean {
    return !isNaN(parseFloat(str)) && isFinite(Number(str));
  }

  private static async extractText(pdf: any): Promise<string[]> {
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      pages.push(text);
    }
    return pages;
  }

  private static detectTables(text: string): TableData[] {
    const tables: TableData[] = [];
    const lines = text.split('\n');
    let currentTable: TableData | null = null;

    lines.forEach((line) => {
      // Detect table headers by looking for multiple consecutive spaces or tabs
      const cells = line.split(/\s{2,}|\t/).filter(cell => cell.trim());
      
      if (cells.length > 1) {
        if (!currentTable) {
          currentTable = { headers: cells, rows: [] };
          tables.push(currentTable);
        } else {
          currentTable.rows.push(cells);
        }
      } else if (currentTable) {
        currentTable = null;
      }
    });

    return tables;
  }

  private static normalizeFinancialData(tables: TableData[]): ParsedData {
    const data: ParsedData = {};
    
    tables.forEach((table, tableIndex) => {
      table.rows.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          const header = table.headers[cellIndex] || `Column${cellIndex + 1}`;
          const key = `${header}_${tableIndex}_${rowIndex}`;
          
          // Convert numeric values and clean up the data
          const value = cell.trim().replace(/,/g, '');
          data[key] = this.isNumeric(value) ? parseFloat(value) : value;
        });
      });
    });

    return data;
  }

  static async parse(file: File): Promise<ParsedData> {
    try {
      logger.log(LogLevel.INFO, 'Starting PDF parsing', { fileName: file.name });

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      // Extract text from all pages
      const pages = await this.extractText(pdf);
      const combinedText = pages.join('\n');

      // Detect and extract tables
      const tables = this.detectTables(combinedText);
      
      // Normalize the data into ParsedData format
      const parsedData = this.normalizeFinancialData(tables);

      logger.log(LogLevel.INFO, 'PDF parsing completed successfully', {
        fileName: file.name,
        tableCount: tables.length,
        dataPoints: Object.keys(parsedData).length
      });

      return parsedData;
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error parsing PDF', { error });
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}