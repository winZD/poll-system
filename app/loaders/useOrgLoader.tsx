import { UserTable } from '@prisma/client';
import { useRouteLoaderData } from '@remix-run/react';

export const useOrgLoader = () => {
  const user = useRouteLoaderData<UserTable>('routes/org.$orgId');

  return user;
};
