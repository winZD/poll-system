import { OrgTable, UserTable } from '@prisma/client';
import { useRouteLoaderData } from '@remix-run/react';
import { assert } from '~/utils';

export const useOrgLoader = () => {
  const user = useRouteLoaderData<UserTable>('routes/org.$orgId');

  assert(user, 'No user defined');

  return user;
};
export const useAppLoader = () => {
  const data = useRouteLoaderData<{ User: UserTable & { Org: OrgTable } }>(
    'routes/app',
  );

  assert(data, 'No user defined');

  return data;
};
