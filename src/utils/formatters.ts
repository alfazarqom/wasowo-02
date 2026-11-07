export const formatIDR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const sanitizeImageList = (mainImg: string | null, additional: unknown): string[] => {
  const result: string[] = [];
  if (mainImg && typeof mainImg === 'string' && mainImg.trim().length > 0) {
    result.push(mainImg.trim());
  }
  if (Array.isArray(additional)) {
    additional.forEach((url) => {
      if (typeof url === 'string' && url.trim().length > 0) {
        if (!result.includes(url.trim())) {
          result.push(url.trim());
        }
      }
    });
  }
  return result;
};
