import { LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
} from '@remix-run/react';
import { MdOutlineLogout } from 'react-icons/md';
import { redirectWithWarning } from 'remix-toast';
import { decodeTokenFromRequest } from '~/auth';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const ctx = await decodeTokenFromRequest(request);

  if (!ctx?.User) return redirect('/login');

  if (ctx.User?.Org.role !== 'ADMIN') {
    return redirectWithWarning(
      `/org/${ctx.User.orgId}`,
      'Nemate pristup ADMIN dijelu aplikacije',
      {
        ...(ctx.headers ? { headers: ctx.headers } : {}),
      },
    );
  }

  return json(
    { User: ctx.User },
    {
      ...(ctx.headers ? { headers: ctx.headers } : {}),
    },
  );
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-1 flex-col">
      {/**
       * HEADER
       */}
      <div className="flex items-center justify-end gap-8 border p-2">
        <div className="text-center">{data.User.name}</div>
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
      <div className="flex flex-1 bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
}
