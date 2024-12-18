import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import React from 'react';
import { ColDef } from 'ag-grid-community';
import { AgGrid } from '~/components/AgGrid';
import { db } from '~/db';
import { rolesMapped, statusClass, statusMapped } from '~/components/models';
import { useAppLoader } from '~/loaders';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();

  const navigate = useNavigate();

  const { User } = useAppLoader();

  const columnDefs = React.useMemo<ColDef<(typeof users)[0]>[]>(
    () => [
      {
        field: 'name',
        headerName: t('table.username'),
        width: 200,
      },
      {
        field: 'email',
        headerName: t('table.email'),
        width: 300,
      },
      {
        field: 'role',
        headerName: t('table.role'),
        width: 120,
        valueFormatter: ({ value }) => rolesMapped[value],
        cellRenderer: ({ value }) => <div className="uppercase">{value}</div>,
      },
      {
        field: 'permissions',
        headerName: t('table.permissions'),
        width: 120,
      },
      {
        field: 'status',
        headerName: t('table.status'),

        flex: 1,
        cellRenderer: ({ value }) => (
          <div className="flex items-center gap-2">
            <div className={`size-4 rounded-full ${statusClass[value]} `} />
            <div>{t(`status.${value}`)}</div>
          </div>
        ),
      },
    ],

    [t],
  );

  return (
    <>
      <div className="flex flex-1 flex-col p-5">
        {User?.role === 'ADMIN' && (
          <div className="flex gap-2">
            <NavLink
              to="create"
              className="m-2 self-start rounded bg-blue-500 px-4 py-1 text-white"
            >
              + {t('addUser')}
            </NavLink>
          </div>
        )}
        <AgGrid
          columnDefs={columnDefs}
          defaultColDef={{ resizable: false }}
          rowData={users}
          onRowClicked={({ data }) => {
            if (User.role === 'ADMIN') {
              navigate(data.id);
            }
          }}
          rowClass={'cursor-pointer hover:bg-slate-100'}
        />
        <Outlet />
      </div>
    </>
  );
}
