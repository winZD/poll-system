import {
  LoaderFunctionArgs,
  json,
  ActionFunctionArgs,
  redirect,
} from '@remix-run/node';
import { NavLink, Outlet, useLoaderData, useParams } from '@remix-run/react';
import React from 'react';
import { decodeTokenFromRequest } from '~/utils';
import { ColDef } from 'ag-grid-community';
import { AgGrid } from '~/components/AgGrid';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');
  //TODO: fix fetch by db.orgTable
  const orgs = await db.orgTable.findUniqueOrThrow({
    where: { id: ctx.userOrgId },
    include: { Polls: true },
  });
  console.log(ctx);
  return json(orgs);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const params = useParams();
  console.log(params);
  const orgs = useLoaderData<typeof loader>();
  console.log(orgs);
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

        <PollsTable />

        {orgs.Polls.map((poll) => (
          <div
            key={poll.id}
            className="max-w-md rounded-lg bg-slate-100 text-slate-800 shadow-md"
          >
            <div className="grid grid-flow-col grid-rows-2 gap-4 p-5">
              <span>{poll.name}</span>
              <span>{poll.status}</span>
              <span>{poll.createdAt.toString()}</span>
              <span>{poll.expiresAt.toString()}</span>
            </div>
          </div>
        ))}

        <Outlet />
      </div>
    </>
  );
}
const PollsTable = () => {
  const orgs = useLoaderData<typeof loader>();

  const columnDefs = React.useMemo<ColDef<(typeof orgs.Polls)[0]>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Ime',
        width: 200,
      },

      {
        field: 'status',
        headerName: 'Status',
        width: 120,
      },

      {
        field: 'iframeTitle',
        headerName: 'Created At',
        width: 150,
      },
      {
        field: 'iframeSrc',
        headerName: 'Expires At',
        width: 150,
      },
    ],
    [],
  );

  return <AgGrid columnDefs={columnDefs} rowData={orgs.Polls} />;
};
