export function getVoucherCodeFromStorage(): string | undefined {
  try {
    const promo = localStorage.getItem('selectedPromoCode');
    if (promo) return promo;
    return undefined;
    
  } catch (e) {
    return undefined;
  }
}
