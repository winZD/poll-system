import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
} from '@remix-run/react';
import { MdOutlineLogout } from 'react-icons/md';
import { decodeTokenFromRequest } from '~/utils';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const ctx = await decodeTokenFromRequest(request);

  const user = await db.userTable.findUniqueOrThrow({
    where: { id: ctx?.userId },
  });

  if (!ctx) return redirect('/login');

  if (user.role !== 'ORG') {
    redirect('/', {});
  }

  return json({ userName: ctx?.userName, orgId: params?.id || '' });
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-1 flex-col text-white">
      <div className="flex items-center justify-center border bg-cyan-900 p-4">
        {`ORG: ${data.userName}`}
      </div>
      <div className="flex flex-1">
        <div className="flex w-52 flex-col border bg-cyan-900">
          <div className="flex flex-1 flex-col">
            <NavLink
              to={data?.orgId}
              className={({ isActive }) =>
                `p-4 ${isActive ? 'bg-cyan-700' : ''}`
              }
            >
              Organizacija
            </NavLink>
          </div>

          <NavLink
            to={'/logout'}
            className={
              'flex items-center justify-center gap-2 p-2 font-bold text-red-500 hover:bg-red-100'
            }
          >
            <div>Odjava</div>
            <MdOutlineLogout />
          </NavLink>
        </div>
        <div className="flex-1 border p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
