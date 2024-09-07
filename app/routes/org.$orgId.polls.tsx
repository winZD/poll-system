import {
  LoaderFunctionArgs,
  json,
  ActionFunctionArgs,
  redirect,
} from '@remix-run/node';
import {
  NavLink,
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
  useSubmit,
} from '@remix-run/react';
import React from 'react';
import { ColDef } from 'ag-grid-community';
import { AgGrid } from '~/components/AgGrid';
import { db } from '~/db';
import { toHrDateString } from '~/utils';
import { jsonWithSuccess } from 'remix-toast';
import { HiOutlineTrash } from 'react-icons/hi2';
import { useConfirmDialog } from '~/components/Dialog';
import { statusValues } from '~/components/models';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId } = params;

  const polls = await db.pollTable.findMany({
    where: { orgId },
    include: { Votes: { select: { id: true } }, User: true },
  });
  return json(polls);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const id = formData.get('id')?.toString();
  const orgId = params.orgId;

  console.log({ orgId, id });

  await db.$transaction(async (tx) => {
    await tx.votesTable.deleteMany({ where: { pollId: id, orgId } });
    await tx.pollQuestionTable.deleteMany({ where: { pollId: id, orgId } });
    await tx.pollTable.delete({ where: { id, orgId } });
  });

  return jsonWithSuccess({}, 'Uspješno izbrisana anketa');
};

export default function Index() {
  const navigate = useNavigate();

  const submit = useSubmit();
  const polls = useLoaderData<typeof loader>();

  const params = useParams();

  const { openDialog } = useConfirmDialog();

  const columnDefs = React.useMemo<ColDef<(typeof polls)[0]>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Naziv ankete',
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

      {
        colId: 'delete',
        sortable: false,
        width: 40,

        cellRenderer: (props) => {
          const isDisabled = props.data.status === statusValues.ACTIVE;

          return (
            <div className="flex h-full flex-row items-center justify-center p-0">
              <button
                onClick={() => {
                  if (isDisabled) return;
                  openDialog({
                    title: 'Brisanje zapisa',
                    buttonText: 'Izbriši',
                    message: 'Potvrdite brisanje zapisa',
                    onConfirm: () =>
                      submit(
                        {
                          id: props.data.id,
                        },
                        { method: 'delete' },
                      ),
                  });
                }}
              >
                <HiOutlineTrash
                  className={`text-lg ${isDisabled ? 'cursor-not-allowed text-zinc-500' : 'text-red-500'}`}
                />
              </button>
            </div>
          );
        },
      },
      { flex: 1 },
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
          onCellClicked={(row) => {
            if (row.colDef.colId === 'delete') return;
            navigate(`${row.data.id}`);
          }}
        />
        <Outlet />
      </div>
    </>
  );
}
