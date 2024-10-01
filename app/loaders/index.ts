import { OrgTable, UserTable } from '@prisma/client';
import { useRouteLoaderData } from '@remix-run/react';
import { assert } from '~/utils';

export const useAppLoader = () => {
  const data = useRouteLoaderData<{
    User: UserTable & {
      Org: OrgTable;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      canReadApi: boolean;
    };
  }>('routes/app');

  assert(data, 'No user defined');

  return data;
};
