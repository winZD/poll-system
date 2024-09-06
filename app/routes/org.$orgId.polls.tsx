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
import { db, decodeTokenFromRequest } from '~/db';
import { toHrDateString } from '~/utils';
import { jsonWithSuccess } from 'remix-toast';
import { MdDelete } from 'react-icons/md';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');
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
  const orgId = formData.get('orgId')?.toString();

  await db.pollTable.delete({
    where: { id: id, orgId },
  });

  return jsonWithSuccess({}, 'Uspješno izbrisana anketa');
};

export default function Index() {
  const navigate = useNavigate();

  const submit = useSubmit();
  const polls = useLoaderData<typeof loader>();

  const params = useParams();

  const columnDefs = React.useMemo<ColDef[]>(
    () => [
      {
        field: 'name',
        headerName: 'Naziv ankete',
        width: 200,
        onCellClicked: ({ data }) => navigate(`${data.id}`),
      },

      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        onCellClicked: ({ data }) => navigate(`${data.id}`),
      },
      {
        field: 'User.name',
        headerName: 'Anketu kreirao',
        width: 200,
        onCellClicked: ({ data }) => navigate(`${data.id}`),
      },
      {
        field: 'createdAt',
        headerName: 'Vrijeme kreiranja',
        width: 200,
        valueFormatter: ({ value }) => toHrDateString(value),
        onCellClicked: ({ data }) => navigate(`${data.id}`),
      },
      {
        field: 'expiresAt',
        headerName: 'Vrijeme završetka',
        width: 200,
        valueFormatter: ({ value }) => toHrDateString(value),
        onCellClicked: ({ data }) => navigate(`${data.id}`),
      },

      {
        sortable: false,

        cellRenderer: (props) => {
          /* const handleDeleteClick = (event: React.MouseEvent) => {
            if (event.button === 0) {
              event.stopPropagation(); // Prevents the event from bubbling up to parent elements
              console.log('Left mouse button pressed down');
              submit(
                {
                  id: props.data.id,
                  orgId: params.orgId ? params.orgId : '',
                },
                { method: 'delete' },
              );
            }
          }; */

          return (
            <div className="flex h-full items-center justify-end gap-x-3">
              <button
                className="rounded bg-red-500 px-2 font-semibold text-white transition duration-300 ease-in-out hover:bg-red-700"
                /* onMouseDown={handleDeleteClick} */
                onClick={() =>
                  submit(
                    {
                      id: props.data.id,
                      orgId: params.orgId ? params.orgId : '',
                    },
                    { method: 'delete' },
                  )
                }
              >
                <MdDelete size={25} />
              </button>
            </div>
          );
        },
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
          /* onRowClicked={({ data }) => navigate(`${data.id}`)} */
        />
        <Outlet />
      </div>
    </>
  );
}
