import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
} from '@remix-run/react';
import { MdOutlineLogout } from 'react-icons/md';
import { redirectWithError } from 'remix-toast';
import { db, decodeTokenFromRequest } from '~/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');

  const user = await db.userTable.findUnique({
    where: { id: ctx?.userId },
    include: { Org: true },
  });

  if (!user) {
    return redirectWithError('/', { message: 'Nepostojeći korisnik' });
  }

  if (user.status !== 'ACTIVE') {
    return redirectWithError('/', { message: 'Korisnik deaktiviran' });
  }

  const { orgId } = params;
  if (user.orgId !== orgId) {
    return redirectWithError('/', { message: 'Nemate ovlasti' });
  }

  return json(user);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-end gap-8 border p-2">
        <div className="text-center">{data.name}</div>
        <NavLink
          to={'/logout'}
          className={
            'flex items-center justify-center gap-2 rounded px-2 py-1 font-bold text-red-500 hover:bg-red-100'
          }
        >
          <div>Odjava</div>
          <MdOutlineLogout />
        </NavLink>
      </div>
      <div className="flex flex-1">
        <div className="flex w-52 flex-col border bg-slate-50">
          <div className="flex flex-1 flex-col">
            <NavLink
              to={'polls'}
              className={({ isActive }) =>
                `p-4 ${isActive ? 'bg-blue-100' : ''}`
              }
            >
              Ankete
            </NavLink>
            <NavLink
              to={'users'}
              className={({ isActive }) =>
                `p-4 ${isActive ? 'bg-blue-100' : ''}`
              }
            >
              Korisnici
            </NavLink>
          </div>
        </div>
        <div className="flex flex-1 bg-slate-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
