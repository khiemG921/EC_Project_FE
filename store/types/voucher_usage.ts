export type VoucherUsage = {
  voucher_usage_id: number;
  voucher_id: number;
  transaction_id?: string;
  used_at: string; // ISO date
};
