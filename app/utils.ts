import { format } from 'date-fns';
import numbro from 'numbro';
import { roleOptions, roleValues, statusValues } from './components/models';
import i18next from 'i18next';

export const getStatusOptions = (): Array<{
  value: keyof typeof statusValues;
  label: string;
}> => [
  { value: statusValues.DRAFT, label: i18next.t('status.DRAFT') },
  { value: statusValues.ACTIVE, label: i18next.t('status.ACTIVE') },
  { value: statusValues.INACTIVE, label: i18next.t('status.INACTIVE') },
];
export const getRoleOptions = (): Array<{
  value: keyof typeof roleValues;
  label: string;
}> => [
  { value: roleValues.ADMIN, label: i18next.t('admin') },
  { value: roleValues.USER, label: i18next.t('user') },
];

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
