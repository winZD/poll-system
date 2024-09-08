import * as zod from 'zod';

export const roleSchema = zod.enum(['ADMIN', 'USER']);
export const roleValues = roleSchema.Values;
export const roleOptions = [
  { value: roleValues.ADMIN, label: 'Admin' },
  { value: roleValues.USER, label: 'Korisnik' },
];
export const rolesMapped = {
  [roleValues.ADMIN]: 'Admin',
  [roleValues.USER]: 'Korisnik',
};
export const statusSchema = zod.enum(['DRAFT', 'ACTIVE', 'INACTIVE']);
export const statusValues = statusSchema.Values;
export const statusOptions = [
  { value: statusValues.DRAFT, label: 'U izradi' },
  { value: statusValues.ACTIVE, label: 'Aktivan' },
  { value: statusValues.INACTIVE, label: 'Neaktivan' },
];
export const statusMapped = {
  [statusValues.DRAFT]: 'U izradi',
  [statusValues.ACTIVE]: 'Aktivan',
  [statusValues.INACTIVE]: 'Neaktivan',
};

export const statusClass = {
  [statusValues.DRAFT]: 'bg-yellow-500',
  [statusValues.ACTIVE]: 'bg-green-500',
  [statusValues.INACTIVE]: 'bg-red-500',
};
