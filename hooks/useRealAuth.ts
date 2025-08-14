// Hook deprecated - sử dụng useAuth từ auth_provider thay thế
import { useAuth } from '@/providers/auth_provider';

export const useMockUser = () => {
  console.warn('useMockUser is deprecated. Use useAuth from auth_provider instead.');
  return useAuth();
};
