import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, NavLink, Outlet, redirect } from '@remix-run/react';
import { decodeTokenFromRequest } from '~/utils';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');

  if (ctx.userRole !== 'ADMIN') {
    return redirect(`/org/${ctx.userId}`);
  }

  return json(null, {
    ...(ctx.headers ? { headers: ctx.headers } : {}),
  });
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="p-4">HEADER</div>
      <div className="flex flex-1">
        <div className="flex flex-col gap-2 bg-zinc-200">
          <NavLink
            to={'active-orgs'}
            className={({ isActive }) => `p-4 ${isActive ? 'bg-blue-200' : ''}`}
          >
            Aktivni korisnici
          </NavLink>
          <NavLink
            to={'inactive-orgs'}
            className={({ isActive }) => `p-4 ${isActive ? 'bg-blue-200' : ''}`}
          >
            Neaktivni korisnici
          </NavLink>
        </div>
        <div className="flex-1 px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
