import { jsPDF } from 'jspdf';
import { formatNPR } from '@/lib/nepalLocale';
import type { PaymentHistoryDirection } from '@/services/payment.service';

export interface StatementReceiptData {
  receiptId: string;
  transactionId: string;
  date: string;
  type: string;
  title: string;
  subtitle?: string;
  detail: string;
  status: string;
  direction: PaymentHistoryDirection;
  currency: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  taskId?: string | null;
  accountName: string;
  accountEmail: string;
  accountLocation?: string;
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function receiptFilename(receiptId: string) {
  const safe = receiptId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 24);
  return `tasknepal-receipt-${safe || 'statement'}.pdf`;
}

export function downloadStatementReceiptPdf(data: StatementReceiptData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const line = (gap = 14) => {
    y += gap;
  };

  const addWrapped = (text: string, size: number, style: 'normal' | 'bold' = 'normal', color = '#111827') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * (size + 4);
  };

  // Header bar
  doc.setFillColor(82, 196, 127);
  doc.rect(0, 0, pageWidth, 72, 'F');
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('TaskNepal', margin, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('TRANSACTION RECEIPT', margin, 56);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(data.receiptId, pageWidth - margin, 40, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.date, pageWidth - margin, 56, { align: 'right' });

  y = 96;

  addWrapped(
    data.direction === 'outgoing' ? 'Outgoing payment record' : 'Earnings release record',
    11,
    'bold',
    '#374151'
  );
  line(8);
  addWrapped(`Status: ${statusLabel(data.status)}`, 10, 'normal', '#6B7280');
  if (data.taskId) {
    line(4);
    addWrapped(`Task reference: ${data.taskId}`, 10, 'normal', '#6B7280');
  }

  line(16);
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  line(16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor('#9CA3AF');
  doc.text('ACCOUNT HOLDER', margin, y);
  y += 16;
  addWrapped(data.accountName, 12, 'bold');
  line(4);
  addWrapped(data.accountEmail, 10, 'normal', '#4B5563');
  if (data.accountLocation) {
    line(4);
    addWrapped(data.accountLocation, 10, 'normal', '#4B5563');
  }

  line(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor('#9CA3AF');
  doc.text('TRANSACTION DETAILS', margin, y);
  y += 16;

  addWrapped(data.type, 11, 'bold');
  line(6);
  addWrapped(data.title, 10, 'bold');

  line(20);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y - 8, contentWidth, 88, 6, 6, 'F');

  const rowY = y + 8;
  const labelX = margin + 16;
  const valueX = pageWidth - margin - 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#4B5563');
  doc.text('Gross amount', labelX, rowY);
  doc.text(formatNPR(data.grossAmount), valueX, rowY, { align: 'right' });

  doc.text('Platform fee', labelX, rowY + 22);
  doc.text(formatNPR(data.platformFee), valueX, rowY + 22, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor('#111827');
  doc.text(
    data.direction === 'outgoing' ? 'Total paid' : 'Net received',
    labelX,
    rowY + 48
  );
  doc.setTextColor('#059669');
  doc.text(formatNPR(data.netAmount), valueX, rowY + 48, { align: 'right' });

  y = rowY + 72;

  line(24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#9CA3AF');
  const footer =
    'This document is a system-generated receipt from TaskNepal. Transaction ID: ' +
    data.transactionId +
    '. For support, contact support@tasknepal.com with this receipt number.';
  const footerLines = doc.splitTextToSize(footer, contentWidth);
  doc.text(footerLines, margin, y);

  doc.save(receiptFilename(data.receiptId));
}

export function printStatementReceipt(element: HTMLElement, title: string) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; color: #111827; padding: 32px; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 300);
}

/** Short display id for statements table, receipts, and PDFs (e.g. #102, #K9F2A). */
export function buildReceiptId(transactionId: string) {
  const digits = transactionId.match(/(\d+)$/)?.[1];
  if (digits) {
    const n = parseInt(digits, 10);
    if (!Number.isNaN(n) && n > 0) {
      if (n <= 99999) return `#${n}`;
      return `#${n.toString(36).toUpperCase()}`;
    }
  }

  let hash = 0;
  for (let i = 0; i < transactionId.length; i += 1) {
    hash = (hash * 31 + transactionId.charCodeAt(i)) >>> 0;
  }
  return `#${hash.toString(36).toUpperCase().slice(0, 5)}`;
}
