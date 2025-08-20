import fetchWithAuth from '@/lib/apiClient';
import {Voucher, VoucherFilters} from '@/types/voucher'

export async function fetchVouchers(filters: VoucherFilters = {}): Promise<Voucher[]> {
  const { search, status, discount, serviceId, signal } = filters;
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'all') params.set('status', status);
  if (discount !== undefined) params.set('discount', String(discount));
  if (serviceId) params.set('serviceId', serviceId);

  const res = await fetchWithAuth(`/api/vouchers?${params.toString()}`, { signal });
  if (!res.ok) throw new Error('Fetch vouchers failed');
  return res.json();
}

export async function getVoucherStats() {
  const res = await fetchWithAuth('/api/vouchers/stats', { method: 'GET' });

  if (!res.ok) {
    throw new Error(`Failed to fetch voucher stats: ${res.status}`);
  }

  return res.json();
}

export async function fetchVoucherSummary(signal?: AbortSignal) {
  const res = await fetchWithAuth('/api/vouchers/summary', { signal });
  if (!res.ok) throw new Error('Fetch voucher summary failed');
  return res.json();
}