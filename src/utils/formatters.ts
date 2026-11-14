/**
 * Persian typography & number formatting utilities
 */

export const toPersianDigits = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => farsiDigits[+w]);
};

export const formatPriceToman = (amountInRial: number): string => {
  const toman = Math.round(amountInRial / 10);
  return toPersianDigits(toman.toLocaleString('fa-IR'));
};

export const formatPersianNumber = (num: number | string): string => {
  if (typeof num === 'number') {
    return toPersianDigits(num.toLocaleString('fa-IR'));
  }
  return toPersianDigits(num);
};

export const toEnglishDigits = (input: string | number | undefined | null): string => {
  if (input === undefined || input === null) return '';
  return String(input)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
};

export const normalizeIranMobile = (input: string | undefined | null): string => {
  const digits = toEnglishDigits(input).replace(/[^0-9+]/g, '');
  if (!digits) return '';
  return digits.replace(/^(\+98|0098|98)/, '0').replace(/[^0-9]/g, '');
};

