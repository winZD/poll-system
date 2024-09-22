import i18next from 'i18next';
import * as zod from 'zod';

export const roleSchema = zod.enum(['ADMIN', 'USER']);
export const roleValues = roleSchema.Values;

export const roleOptions: Array<{
  value: keyof typeof roleValues; // Ensures the value is a key of roleValues
  label: string;
}> = [
  { value: roleValues.ADMIN, label: 'Admin' },
  { value: roleValues.USER, label: 'Korisnik' },
];

type RolesMappedType = {
  [key in (typeof roleValues)[keyof typeof roleValues]]: string;
};

export const rolesMapped: RolesMappedType = {
  [roleValues.ADMIN]: 'Admin',
  [roleValues.USER]: 'Korisnik',
};

export const statusSchema = zod.enum(['DRAFT', 'ACTIVE', 'INACTIVE']);
export const statusValues = statusSchema.Values;
export const statusOptions: Array<{
  value: keyof typeof statusValues;
  label: string;
}> = [
  { value: statusValues.DRAFT, label: i18next.t('status.DRAFT') },
  { value: statusValues.ACTIVE, label: 'Aktivan' },
  { value: statusValues.INACTIVE, label: 'Neaktivan' },
];

type StatusMappedType = {
  [key in (typeof statusValues)[keyof typeof statusValues]]: string;
};

export const statusMapped: StatusMappedType = {
  [statusValues.DRAFT]: 'U izradi',
  [statusValues.ACTIVE]: 'Aktivan',
  [statusValues.INACTIVE]: 'Neaktivan',
};

export const statusClass = {
  [statusValues.DRAFT]: 'bg-yellow-500',
  [statusValues.ACTIVE]: 'bg-green-500',
  [statusValues.INACTIVE]: 'bg-red-500',
};
