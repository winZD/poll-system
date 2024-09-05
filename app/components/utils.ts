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

  console.log('inside');

  return format(date, 'dd.MM.yyyy. HH:mm');
}
