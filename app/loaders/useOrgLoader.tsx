import { UserTable } from '@prisma/client';
import { useRouteLoaderData } from '@remix-run/react';
import { assert } from '~/utils';

export const useOrgLoader = () => {
  const user = useRouteLoaderData<UserTable>('routes/org.$orgId');

  assert(user, 'No user defined');

  return user;
};
