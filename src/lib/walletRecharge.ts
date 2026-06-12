/** Match backend `is_wallet_recharge_from_meta` / WALLET_RECHARGE_Q. */

export interface WalletTransactionLike {
  transaction_type: string;
  description: string;
  metadata?: Record<string, unknown> | null;
}

export function isWalletRechargeTransaction(tx: WalletTransactionLike): boolean {
  if (!['credit', 'bonus'].includes(tx.transaction_type)) {
    return false;
  }

  const meta = tx.metadata ?? {};
  if (meta.channel === 'admin_manual') return true;
  if (meta.gateway === 'esewa' || meta.gateway === 'khalti') return true;
  if (meta.esewa_transaction_uuid) return true;
  if (meta.khalti_transaction_id) return true;

  const desc = (tx.description || '').toLowerCase();
  return desc.includes('wallet recharge') || desc.includes('manual wallet recharge');
}

export function getWalletRechargeMethodLabel(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('esewa')) return 'eSewa';
  if (desc.includes('khalti')) return 'Khalti';
  if (desc.includes('manual wallet recharge') || desc.includes('admin')) return 'Admin manual';
  if (desc.includes('bank')) return 'Bank transfer';
  if (desc.includes('wallet recharge')) return 'Wallet recharge';
  return 'Wallet recharge';
}
