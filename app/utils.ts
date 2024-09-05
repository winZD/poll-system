import { format } from 'date-fns';
import numbro from 'numbro';

export const formatter = {
  number: {
    toAmount: (value: number | undefined | null) => {
      if (value === undefined || value === null) return '';
      return numbro(value).format({
        thousandSeparated: true,
        mantissa: 2, // number of decimals displayed
      });
    },
  },
};

export function toHrDateString(date: any): string {
  if (!date) return '';
  // Ensure the date is a valid Date object
  return format(date, 'dd.MM.yyyy. HH:mm');
}

type Assert = (condition: unknown, error?: string) => asserts condition;
export const assert: Assert = (condition: any, message?: string) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};
