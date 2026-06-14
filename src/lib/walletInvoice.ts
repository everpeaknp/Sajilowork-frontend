import { formatNPR } from '@/lib/nepalLocale';
import { buildReceiptId, buildShortReferenceId } from '@/lib/statementReceiptPdf';
import type { StatementReceipt } from '@/app/dashboard/StatementReceiptModal';
import type { ReceiptLabelOverrides } from '@/app/dashboard/StatementReceiptModal';
import type { Recharge, RechargeStatus } from '@/app/dashboard/DashboardRecharges';
import type { Payout, PayoutStatus } from '@/app/dashboard/DashboardPayouts';
import type { PaymentHistoryDirection } from '@/services/payment.service';

export type WalletInvoiceLabels = ReceiptLabelOverrides;

export interface WalletInvoiceView {
  statement: StatementReceipt;
  direction: PaymentHistoryDirection;
  labels: WalletInvoiceLabels;
}

function payoutStatusToReceiptStatus(status: RechargeStatus | PayoutStatus): string {
  switch (status) {
    case 'Approved':
      return 'completed';
    case 'Processing':
      return 'processing';
    case 'Cancelled':
      return 'cancelled';
    case 'Rejected':
      return 'failed';
    case 'Failed':
      return 'failed';
    case 'Pending Orange':
    case 'Pending Blue':
      return 'pending';
    default:
      return 'pending';
  }
}

export function mapRechargeToInvoice(recharge: Recharge): WalletInvoiceView {
  const gross = recharge.grossVal ?? recharge.amountVal;
  const fee = recharge.feeVal ?? 0;
  const net = recharge.netVal ?? recharge.amountVal;
  const createdAt = recharge.createdAt ?? recharge.date;

  return {
    direction: 'earned',
    labels: {
      documentTitle: 'Wallet Recharge Invoice',
      documentSubtitle: 'Official wallet top-up record',
      descriptionHeading: 'Recharge details',
      totalLabel: 'Amount credited',
      directionLabel: 'Recharge',
    },
    statement: {
      id: recharge.id,
      receiptId: buildReceiptId(recharge.id),
      date: recharge.date,
      createdAt,
      type: 'Wallet Recharge',
      title: `Wallet top-up via ${recharge.rechargeMethod}`,
      subtitle: recharge.referenceNumber
        ? `Ref: ${buildShortReferenceId(recharge.referenceNumber)}`
        : '',
      detail: `Wallet recharge via ${recharge.rechargeMethod}`,
      price: formatNPR(gross),
      priceVal: gross,
      amount: formatNPR(net),
      amountVal: net,
      grossVal: gross,
      netVal: net,
      feeVal: fee,
      status: payoutStatusToReceiptStatus(recharge.status),
      currency: 'NPR',
    },
  };
}

export function mapPayoutToInvoice(payout: Payout): WalletInvoiceView {
  const gross = payout.grossVal ?? payout.amountVal;
  const fee = payout.feeVal ?? 0;
  const net = payout.netVal ?? payout.amountVal;
  const createdAt = payout.createdAt ?? payout.date;

  return {
    direction: 'earned',
    labels: {
      documentTitle: 'Withdrawal Invoice',
      documentSubtitle: 'Official payout record',
      descriptionHeading: 'Withdrawal details',
      totalLabel: fee > 0 ? 'Net payout' : 'Amount withdrawn',
      feeLabel: 'Processing fee',
      directionLabel: 'Withdrawal',
    },
    statement: {
      id: payout.id,
      receiptId: buildReceiptId(payout.id),
      date: payout.date,
      createdAt,
      type: 'Wallet Payout',
      title: `Withdrawal to ${payout.payoutMethod}`,
      subtitle: '',
      detail: `Withdrawal via ${payout.payoutMethod}`,
      price: formatNPR(gross),
      priceVal: gross,
      amount: formatNPR(net),
      amountVal: net,
      grossVal: gross,
      netVal: net,
      feeVal: fee,
      status: payoutStatusToReceiptStatus(payout.status),
      currency: 'NPR',
    },
  };
}
