import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
} from '@remix-run/react';
import { MdOutlineLogout } from 'react-icons/md';
import { redirectWithSuccess } from 'remix-toast';
import { decodeTokenFromRequest } from '~/utils';
import { db } from '~/utils/db';

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
    return redirectWithSuccess(
      '/admin/active-orgs',
      'Uspješno deaktivirana organizacija',
    );
  }
  if (action === 'ACTIVATE') {
    await db.$transaction(async (tx) => {
      await tx.orgTable.update({
        where: { id: orgId },
        data: { status: 'ACTIVE' },
      });
    });
    return redirectWithSuccess(
      '/admin/inactive-orgs',
      'Uspješno aktivirana organizacija',
    );
  }
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-end gap-8 border p-2">
        <div className="text-center">{data.userName}</div>
        <NavLink
          to={'/logout'}
          className={
            'flex items-center justify-center gap-2 rounded px-2 py-1 font-bold text-red-500 hover:bg-red-100'
          }
        >
          <div>Odjava</div>
          <MdOutlineLogout />
        </NavLink>{' '}
      </div>
      <div className="flex flex-1">
        <div className="flex flex-col gap-8 border-r bg-slate-50">
          <div className="flex flex-1 flex-col">
            <NavLink
              to={'active-orgs'}
              className={({ isActive }) =>
                `px-4 py-6 font-bold hover:bg-blue-200 ${isActive ? 'bg-blue-100' : ''}`
              }
            >
              Aktivni korisnici
            </NavLink>
            <NavLink
              to={'inactive-orgs'}
              className={({ isActive }) =>
                `px-4 py-6 font-bold hover:bg-blue-200 ${isActive ? 'bg-blue-100' : ''}`
              }
            >
              Neaktivni korisnici
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
