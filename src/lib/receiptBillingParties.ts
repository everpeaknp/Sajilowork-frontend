import type { PaymentHistoryDirection } from '@/services/payment.service';

export interface BillingParty {
  name: string;
  email: string;
  location: string;
}

export const TASKNEPAL_PLATFORM: BillingParty = {
  name: 'TaskNepal Pvt. Ltd.',
  email: 'support@tasknepal.com',
  location: 'Kathmandu, Nepal',
};

export function resolveBillingParties(options: {
  direction: PaymentHistoryDirection;
  statementType: string;
  account: BillingParty;
  counterparty?: Partial<BillingParty>;
  billedFrom?: BillingParty;
  billedTo?: BillingParty;
}): { billedFrom: BillingParty; billedTo: BillingParty } {
  if (options.billedFrom && options.billedTo) {
    return { billedFrom: options.billedFrom, billedTo: options.billedTo };
  }

  const { direction, statementType, account, counterparty } = options;
  const isWalletInvoice =
    statementType === 'Wallet Recharge' || statementType === 'Wallet Payout';

  if (isWalletInvoice) {
    return { billedFrom: TASKNEPAL_PLATFORM, billedTo: account };
  }

  const other: BillingParty = counterparty?.name
    ? {
        name: counterparty.name,
        email: counterparty.email || '—',
        location: counterparty.location || 'Nepal',
      }
    : TASKNEPAL_PLATFORM;

  if (direction === 'earned') {
    return { billedFrom: account, billedTo: other };
  }

  return { billedFrom: other, billedTo: account };
}
