import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import React from 'react';
import { jsonWithSuccess } from 'remix-toast';
import { Button } from '~/components/Button';
import { ColDef } from 'ag-grid-community';
import { AgGrid } from '~/components/AgGrid';
import { db } from '~/db';
import { rolesMapped, statusClass, statusMapped } from '~/components/models';
import { toHrDateString } from '~/utils';
import { useConfirmDialog } from '~/components/Dialog';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // return redirect("active-orgs");

  const { orgId } = params;

  const org = await db.orgTable.findUniqueOrThrow({
    where: { id: orgId },
    include: {
      Users: {
        orderBy: [{ status: 'asc' }, { role: 'asc' }, { name: 'asc' }],
      },
      Polls: {
        include: { User: true },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      },
    },
  });
  return json(org);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const action = formData.get('action')?.toString();
  const orgId = formData.get('orgId')?.toString();

  if (action === 'DEACTIVATE') {
    await db.$transaction(async (tx) => {
      await tx.orgTable.update({
        where: { id: orgId },
        data: { status: 'INACTIVE' },
      });

      await tx.pollTable.updateMany({
        where: { orgId: orgId },
        data: { status: 'INACTIVE' },
      });
    });
    return jsonWithSuccess({}, 'Uspješno deaktivirana organizacija');
  }
  if (action === 'ACTIVATE') {
    await db.$transaction(async (tx) => {
      await tx.orgTable.update({
        where: { id: orgId },
        data: { status: 'ACTIVE' },
      });
    });
    return jsonWithSuccess({}, 'Uspješno aktivirana organizacija');
  }
};

export default function Index() {
  const org = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTab = searchParams.get('tab') || 'korisnici';

  const submit = useSubmit();

  const { openDialog } = useConfirmDialog();

  return (
    <>
      <div className="flex flex-1 flex-col items-start gap-8 p-4">
        {org.status === 'ACTIVE' ? (
          <Button
            className="border-red-500 bg-transparent font-semibold text-red-500 hover:border-red-700 hover:bg-transparent hover:text-red-700"
            onClick={() =>
              openDialog({
                title: `Deaktivacija ${org.name}`,
                message: 'Deaktivacijom ćete ujedno otkazati sve aktive ankete',
                buttonText: 'Deaktiviraj',
                onConfirm: () =>
                  submit(
                    { action: 'DEACTIVATE', orgId: org.id },
                    { method: 'post' },
                  ),
              })
            }
          >
            Deaktiviraj organizaciju
          </Button>
        ) : (
          <Button
            className="border-green-500 bg-transparent font-semibold text-green-500 hover:border-green-700 hover:bg-transparent hover:text-green-700"
            onClick={() =>
              submit({ action: 'ACTIVATE', orgId: org.id }, { method: 'post' })
            }
          >
            Aktiviraj organizaciju
          </Button>
        )}

        <div className="flex flex-col gap-2 font-semibold">
          <div>{`${org.name} `}</div>
          <div>{`${org.email} `}</div>
        </div>

        <div className="flex flex-1 flex-col self-stretch">
          <div className="text-primary-900 flex font-semibold">
            <div
              onClick={() => {
                const params = new URLSearchParams();
                params.set('tab', 'korisnici');
                setSearchParams(params);
              }}
              className={`cursor-pointer rounded-t px-4 py-1 ${
                selectedTab === 'korisnici' ? 'bg-slate-200' : ''
              }`}
            >
              Korisnici
            </div>
            <div
              onClick={() => {
                const params = new URLSearchParams();
                params.set('tab', 'ankete');
                setSearchParams(params);
              }}
              className={`cursor-pointer rounded-t px-4 py-1 ${
                selectedTab === 'ankete' ? 'bg-slate-200' : ''
              }`}
            >
              Ankete
            </div>
          </div>

          {selectedTab === 'korisnici' && <UsersTable />}
          {selectedTab === 'ankete' && <PollsTable />}
        </div>
      </div>
      <Outlet />
    </>
  );
}

const UsersTable = (props) => {
  const org = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  const columnDefs = React.useMemo<ColDef<(typeof org.Users)[0]>[]>(
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
        headerName: 'Uloga',
        width: 120,
        valueFormatter: ({ value }) => rolesMapped[value],
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
        cellRenderer: ({ value }) => (
          <div className="flex items-center gap-2">
            <div className={`size-4 rounded-full ${statusClass[value]} `} />
            <div>{statusMapped[value]}</div>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AgGrid
      onRowClicked={({ data }) =>
        navigate(`users/${data.id}${location.search}`)
      }
      columnDefs={columnDefs}
      rowData={org.Users}
      rowClass={'cursor-pointer hover:bg-slate-100'}
    />
  );
};

const PollsTable = (props) => {
  const org = useLoaderData<typeof loader>();

  const location = useLocation();
  const navigate = useNavigate();

  const columnDefs = React.useMemo<ColDef<(typeof org.Polls)[0]>[]>(
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
        cellRenderer: ({ value }) => (
          <div className="flex items-center gap-2">
            <div className={`size-4 rounded-full ${statusClass[value]} `} />
            <div>{statusMapped[value]}</div>
          </div>
        ),
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
    <AgGrid
      columnDefs={columnDefs}
      rowData={org.Polls}
      onRowClicked={({ data }) => navigate(`poll/${data.id}${location.search}`)}
      rowClass={'cursor-pointer hover:bg-slate-100'}
    />
  );
};
