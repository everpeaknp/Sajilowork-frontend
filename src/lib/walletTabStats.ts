import type { PayoutStatus } from '@/app/dashboard/DashboardPayouts';

export interface WalletTabSummary {
  rechargeBalance?: number;
  availableBalance?: number;
  withdrawableBalance?: number;
  pendingWithdrawals?: number;
}

export function mapWithdrawalStatusToPayout(status: string, index = 0): PayoutStatus {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'Approved';
    case 'approved':
    case 'processing':
      return 'Processing';
    case 'pending':
      return index % 2 === 0 ? 'Pending Orange' : 'Pending Blue';
    case 'cancelled':
      return 'Cancelled';
    case 'rejected':
      return 'Rejected';
    case 'failed':
      return 'Failed';
    default:
      return 'Processing';
  }
}

export function isApprovedWalletStatus(status: PayoutStatus): boolean {
  return status === 'Approved';
}

export function isPendingWalletStatus(status: PayoutStatus): boolean {
  return status === 'Pending Orange' || status === 'Pending Blue' || status === 'Processing';
}

export function isActiveWithdrawal(payout: { status: PayoutStatus; rawStatus?: string }): boolean {
  const raw = payout.rawStatus?.toLowerCase();
  if (raw) {
    return raw === 'pending' || raw === 'processing' || raw === 'approved';
  }
  return isPendingWalletStatus(payout.status);
}

export function isCompletedWithdrawal(payout: { status: PayoutStatus; rawStatus?: string }): boolean {
  const raw = payout.rawStatus?.toLowerCase();
  if (raw) {
    return raw === 'completed';
  }
  return payout.status === 'Approved';
}

export function canUserCancelWithdrawal(payout: {
  status: PayoutStatus;
  rawStatus?: string;
}): boolean {
  return isActiveWithdrawal(payout);
}

export function sumWalletAmountsByStatus(
  items: { amountVal: number; status: PayoutStatus; rawStatus?: string }[],
  mode: 'approved' | 'pending'
): number {
  return items.reduce((sum, item) => {
    const matches =
      mode === 'approved' ? isCompletedWithdrawal(item) : isActiveWithdrawal(item);
    return matches ? sum + item.amountVal : sum;
  }, 0);
}

export function countActiveWithdrawals(
  items: { status: PayoutStatus; rawStatus?: string }[]
): number {
  return items.filter(isActiveWithdrawal).length;
}

export function countCompletedWithdrawals(
  items: { status: PayoutStatus; rawStatus?: string }[]
): number {
  return items.filter(isCompletedWithdrawal).length;
}
