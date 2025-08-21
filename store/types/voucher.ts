export type Voucher = {
  voucher_id: number;
  voucher_code: string;
  detail?: string | null;
  discount_percentage: number;
  expiry_date: string; // ISO date
  is_active: boolean;
  service_ids?: string | null;
  used_count?: number;
};

export type VoucherFilters = {
  search?: string;
  discount?: number;
  status?: 'active' | 'expired';
};
