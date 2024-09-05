import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData, useParams } from '@remix-run/react';
import React from 'react';
import { ColDef } from 'ag-grid-community';
import { AgGrid } from '~/components/AgGrid';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId } = params;

  //TODO: fix fetch by db.orgTable
  const users = await db.userTable.findMany({
    where: { orgId },
  });
  return json(users);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const users = useLoaderData<typeof loader>();

  const columnDefs = React.useMemo<ColDef<(typeof users)[0]>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Ime',
        width: 200,
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 300,
      },
      {
        field: 'role',
        headerName: 'Rola',
        width: 120,
      },
      {
        field: 'permissions',
        headerName: 'Ovlasti',
        width: 120,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
      },
    ],
    [],
  );

  return (
    <>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex gap-2">
          <NavLink
            to="create"
            className="m-2 self-start rounded bg-blue-500 px-4 py-1 text-white"
          >
            + Dodaj korisnika
          </NavLink>
        </div>

        <AgGrid columnDefs={columnDefs} rowData={users} />
        <Outlet />
      </div>
    </>
  );
}
