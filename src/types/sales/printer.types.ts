export type PrinterType = 'THERMAL' | 'INKJET' | 'LABEL';

export type PrinterConnection = 'USB' | 'NETWORK' | 'BLUETOOTH' | 'SERIAL';

export interface SalesPrinter {
  id: string;
  name: string;
  type: PrinterType;
  connection: PrinterConnection;
  ipAddress: string | null;
  port: number | null;
  deviceId: string | null;
  bluetoothAddress: string | null;
  paperWidth: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface ListPrintersResponse {
  printers: SalesPrinter[];
}

export interface RegisterPrinterRequest {
  name: string;
  type: PrinterType;
  connection: PrinterConnection;
  ipAddress?: string;
  port?: number;
  deviceId?: string;
  bluetoothAddress?: string;
  paperWidth?: 80 | 58;
  isDefault?: boolean;
}

export interface RegisterPrinterResponse {
  id: string;
  name: string;
  status: 'active';
}

export interface QueueReceiptRequest {
  printerId?: string;
}

export interface QueueReceiptResponse {
  jobId: string;
  status: 'queued';
}

export interface PreviewReceiptResponse {
  content: string;
  format: 'escpos';
}
