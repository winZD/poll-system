import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import {
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from '@remix-run/react';
import React from 'react';
import { ColDef } from 'ag-grid-community';
import { AgGrid } from '~/components/AgGrid';
import { format } from 'date-fns';
import { db } from '~/db';
import { toHrDateString } from '~/utils';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId } = params;

  //TODO: fix fetch by db.orgTable
  const polls = await db.pollTable.findMany({
    where: { orgId },
    include: { Votes: { select: { id: true } }, User: true },
  });
  return json(polls);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const navigate = useNavigate();

  const polls = useLoaderData<typeof loader>();

  const columnDefs = React.useMemo<ColDef<(typeof polls)[0]>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Naziv anketa',
        width: 200,
      },

      {
        field: 'status',
        headerName: 'Status',
        width: 120,
      },
      {
        field: 'User.name',
        headerName: 'Anketu kreirao',
        width: 200,
      },
      {
        field: 'createdAt',
        headerName: 'Vrijeme kreiranja',
        width: 200,
        valueFormatter: ({ value }) => toHrDateString(value),
      },
      {
        field: 'expiresAt',
        headerName: 'Vrijeme završetka',
        width: 200,
        valueFormatter: ({ value }) => toHrDateString(value),
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
            + Dodaj anketu
          </NavLink>
        </div>

        <AgGrid
          rowClass={'cursor-pointer hover:bg-slate-100'}
          columnDefs={columnDefs}
          rowData={polls}
          onRowClicked={({ data }) => navigate(`${data.id}`)}
          /* onRowClicked={({ data }) => console.log(data)} */
        />
        <Outlet />
      </div>
    </>
  );
}
