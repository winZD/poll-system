import {
  LoaderFunctionArgs,
  json,
  ActionFunctionArgs,
  redirect,
} from '@remix-run/node';
import { NavLink, Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import React from 'react';
import { ColDef } from 'ag-grid-community';
import { AgGrid } from '~/components/AgGrid';
import { useOrgLoader } from '~/loaders/useOrgLoader';
import { db } from '~/db';
import {
  rolesMapped,
  roleValues,
  statusClass,
  statusMapped,
} from '~/components/models';
import { TbPasswordUser } from 'react-icons/tb';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId } = params;

  const users = await db.userTable.findMany({
    where: { orgId },
    orderBy: [{ status: 'asc' }, { role: 'asc' }, { name: 'asc' }],
  });
  return json(users);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const users = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  const user = useOrgLoader();

  const isAdmin = user.role === roleValues.ADMIN;

  const columnDefs = React.useMemo<ColDef<(typeof users)[0]>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Ime korisnika',
        width: 200,
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 300,
      },
      {
        field: 'role',
        headerName: 'Uloga',
        width: 120,
        valueFormatter: ({ value }) => rolesMapped[value],
      },
      {
        field: 'permissions',
        headerName: 'Ovlasti',
        width: 120,
      },

      { flex: 1 },
    ],

    [],
  );

  return (
    <>
      <div className="flex flex-1 flex-col p-5">
        {user?.role === 'ADMIN' && (
          <div className="flex gap-2">
            <NavLink
              to="create"
              className="m-2 self-start rounded bg-blue-500 px-4 py-1 text-white"
            >
              + Dodaj korisnika
            </NavLink>
          </div>
        )}

        <AgGrid
          columnDefs={columnDefs}
          rowData={users}
          onRowClicked={({ data }) => navigate(data.id)}
          rowClass={'cursor-pointer hover:bg-slate-100'}
        />
        <Outlet />
      </div>
    </>
  );
}
