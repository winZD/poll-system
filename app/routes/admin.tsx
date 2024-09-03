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

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');

  if (ctx.userOrgRole !== 'ADMIN') {
    return redirect(`/org/${ctx.userOrgId}`, {
      ...(ctx.headers ? { headers: ctx.headers } : {}),
    });
  }

  return json(
    { userName: ctx.userName },
    {
      ...(ctx.headers ? { headers: ctx.headers } : {}),
    },
  );
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-center border p-4">
        {`HEADER`}
      </div>
      <div className="flex flex-1">
        <div className="flex flex-col gap-8 border-r bg-zinc-50">
          <div className="flex flex-1 flex-col">
            <NavLink
              to={'active-orgs'}
              className={({ isActive }) =>
                `p-4 hover:bg-blue-200 ${isActive ? 'bg-blue-100' : ''}`
              }
            >
              Aktivni korisnici
            </NavLink>
            <NavLink
              to={'inactive-orgs'}
              className={({ isActive }) =>
                `p-4 hover:bg-blue-200 ${isActive ? 'bg-blue-100' : ''}`
              }
            >
              Neaktivni korisnici
            </NavLink>
          </div>

          <div className="text-center">{data.userName}</div>

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
        <div className="flex flex-1 bg-zinc-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
