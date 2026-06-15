import { jsPDF } from 'jspdf';
import { formatNPR } from '@/lib/nepalLocale';
import { RECEIPT_DOCUMENT_STYLES } from '@/lib/receiptDocumentStyles';
import type { PaymentHistoryDirection } from '@/services/payment.service';
import type { BillingParty } from '@/lib/receiptBillingParties';

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
  billedFrom: BillingParty;
  billedTo: BillingParty;
  descriptionHeading?: string;
  totalLabel?: string;
  feeLabel?: string;
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPaidStatus(status: string) {
  return ['released', 'succeeded', 'completed'].includes(status.toLowerCase());
}

function receiptFilename(receiptId: string) {
  const safe = receiptId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 24);
  return `tasknepal-receipt-${safe || 'statement'}.pdf`;
}

function buildStatementReceiptDoc(data: StatementReceiptData): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const accentGreen = [82, 196, 127] as const;
  const dark = '#111827';
  const muted = '#6b7280';
  const lightMuted = '#9ca3af';
  const success = '#059669';

  // Top accent bar
  doc.setFillColor(...accentGreen);
  doc.rect(0, 0, pageWidth, 4, 'F');

  y = margin + 8;

  // Brand block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(dark);
  doc.text('TaskNepal', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(muted);
  doc.text('Kathmandu, Nepal', margin, y);
  y += 12;
  doc.text('support@tasknepal.com', margin, y);

  // Receipt meta (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(lightMuted);
  doc.text('RECEIPT', pageWidth - margin, margin + 8, { align: 'right' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(dark);
  doc.text(data.receiptId, pageWidth - margin, margin + 24, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(muted);
  doc.text(data.date, pageWidth - margin, margin + 40, { align: 'right' });

  y = margin + 72;

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  // Two columns: Billed from / Billed to
  const colGap = 24;
  const colWidth = (contentWidth - colGap) / 2;

  const sectionLabel = (label: string, x: number, startY: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(lightMuted);
    doc.text(label, x, startY);
    return startY + 16;
  };

  const drawParty = (party: BillingParty, x: number, startY: number) => {
    let partyY = startY;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(dark);
    doc.text(party.name, x, partyY);
    partyY += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(muted);
    doc.text(party.email, x, partyY);
    partyY += 12;
    doc.text(party.location, x, partyY);
    return partyY;
  };

  let leftY = sectionLabel('BILLED FROM', margin, y);
  leftY = drawParty(data.billedFrom, margin, leftY);

  const rightX = margin + colWidth + colGap;
  let rightY = sectionLabel('BILLED TO', rightX, y);
  rightY = drawParty(data.billedTo, rightX, rightY);

  y = Math.max(leftY, rightY) + 24;

  // Payment details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(lightMuted);
  doc.text('PAYMENT DETAILS', margin, y);
  y += 16;

  doc.setFillColor(5, 150, 105);
  doc.circle(margin + 2, y - 3, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(success);
  doc.text(statusLabel(data.status), margin + 8, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(muted);
  doc.text(data.type, margin, y);
  y += 12;
  doc.text(
    data.direction === 'outgoing' ? 'Outgoing payment' : 'Earned release',
    margin,
    y
  );
  y += 12;
  doc.text(`Currency: ${data.currency || 'NPR'}`, margin, y);
  y += 24;

  // Description box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, y, contentWidth, 56, 8, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(lightMuted);
  doc.text(
    (data.descriptionHeading ?? (data.direction === 'outgoing' ? 'PAYMENT FOR' : 'EARNINGS FROM')).toUpperCase(),
    margin + 16,
    y + 18
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(dark);
  const titleLines = doc.splitTextToSize(data.title, contentWidth - 32);
  doc.text(titleLines, margin + 16, y + 34);

  if (data.taskId) {
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(muted);
    doc.text(
      `Task ref: ${buildShortReferenceId(data.taskId)}`,
      margin + 16,
      y + 34 + titleLines.length * 12 + 4
    );
  }

  y += 72;

  // Amount table header
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, y, contentWidth, 28, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(margin, y, contentWidth, 28, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(muted);
  doc.text('DESCRIPTION', margin + 16, y + 18);
  doc.text('AMOUNT', pageWidth - margin - 16, y + 18, { align: 'right' });

  y += 28;

  const drawRow = (label: string, value: string, bold = false) => {
    doc.setDrawColor(243, 244, 246);
    doc.line(margin, y + 28, pageWidth - margin, y + 28);

    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 11 : 10);
    doc.setTextColor(bold ? dark : '#374151');
    doc.text(label, margin + 16, y + 18);
    doc.text(value, pageWidth - margin - 16, y + 18, { align: 'right' });
    y += 28;
  };

  drawRow('Gross amount', formatNPR(data.grossAmount));
  drawRow(
    data.feeLabel ?? 'Platform fee',
    data.platformFee > 0 ? `- ${formatNPR(data.platformFee)}` : formatNPR(0)
  );

  // Total row
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, y, contentWidth, 36, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(dark);
  doc.text(
    data.totalLabel ?? (data.direction === 'outgoing' ? 'Total paid' : 'Net received'),
    margin + 16,
    y + 22
  );
  doc.setFontSize(14);
  doc.setTextColor(success);
  doc.text(formatNPR(data.netAmount), pageWidth - margin - 16, y + 22, { align: 'right' });
  y += 48;

  // Paid stamp watermark
  if (isPaidStatus(data.status)) {
    doc.setTextColor(209, 250, 229);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(42);
    doc.text('PAID', pageWidth * 0.58, y - 16, { angle: -12 });
  }

  // Footer
  doc.setDrawColor(209, 213, 219);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDashPattern([], 0);

  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(muted);
  doc.text(`Transaction ID: ${buildShortReferenceId(data.transactionId)}`, margin, y);
  y += 16;

  const generatedAt = new Date().toLocaleString('en-NP', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const footer =
    `Thank you for using TaskNepal. This is a system-generated receipt. Generated on ${generatedAt}. ` +
    `For support, email support@tasknepal.com and include receipt ${data.receiptId}.`;
  const footerLines = doc.splitTextToSize(footer, contentWidth);
  doc.setTextColor(lightMuted);
  doc.text(footerLines, margin, y);

  // Page footer
  doc.setFontSize(7);
  doc.text('TaskNepal · tasknepal.com', pageWidth / 2, pageHeight - 28, { align: 'center' });

  return doc;
}

export function downloadStatementReceiptPdf(data: StatementReceiptData): void {
  const doc = buildStatementReceiptDoc(data);
  const filename = receiptFilename(data.receiptId);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function printStatementReceipt(element: HTMLElement, title: string) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!frameDoc) {
    document.body.removeChild(iframe);
    return;
  }

  const safeTitle = title.replace(/[<>&"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      default:
        return char;
    }
  });

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${safeTitle}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            color: #111827;
            background: #fff;
            padding: 32px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          ${RECEIPT_DOCUMENT_STYLES}
          @media print {
            body { background: #fff; padding: 0; }
            .tn-receipt { box-shadow: none; }
          }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `);
  frameDoc.close();

  const printFrame = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      window.setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 1_000);
    }
  };

  if (iframe.contentWindow?.document.readyState === 'complete') {
    printFrame();
  } else {
    iframe.onload = printFrame;
  }
}

/** Compact alphanumeric ref for UUIDs and long ids (e.g. 6D3B25FF, 23403261). */
export function buildShortReferenceId(rawId: string): string {
  const value = rawId?.trim();
  if (!value) return '—';

  if (value.length <= 10 && !value.includes('-')) {
    return value.toUpperCase();
  }

  const stripped = value.replace(/^(wallet|recharge|payout|payment|txn|task)[-_]/i, '');

  const uuidMatch = stripped.match(
    /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i
  );
  if (uuidMatch) {
    return uuidMatch[1].toUpperCase();
  }

  const hex = stripped.replace(/[^a-fA-F0-9]/g, '');
  if (hex.length >= 8) {
    return hex.slice(0, 8).toUpperCase();
  }

  const trailingNum = value.match(/(\d+)$/);
  if (trailingNum) {
    const n = trailingNum[1];
    return n.length <= 8 ? n : n.slice(-8);
  }

  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().slice(0, 8);
}

/** Short display id for statements table, receipts, and PDFs (e.g. #6D3B25FF, #23403261). */
export function buildReceiptId(transactionId: string) {
  return `#${buildShortReferenceId(transactionId)}`;
}
