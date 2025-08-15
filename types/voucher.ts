export type Voucher = {
    id: string;
    voucher_code: string;
    detail: string;
    expiry_date: string;
    discount_percentage: number;
    is_active: boolean;
    service_ids?: string;
};

export interface VoucherFilters {
  search?: string;
  status?: string;
  discount?: number;
  serviceId?: string;
  signal?: AbortSignal;
}