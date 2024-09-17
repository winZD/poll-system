import { LoaderFunctionArgs } from '@remix-run/node';
import { json, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { MdOutlineLogout } from 'react-icons/md';
import { redirectWithWarning } from 'remix-toast';
import { getUserFromRequest } from '~/auth';
import { roleValues, statusClass } from '~/components/models';
import { db } from '~/db';
import { useAppLoader } from '~/loaders';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const user = await getUserFromRequest(request);
  if (user?.Org.role === roleValues.USER) {
    return redirectWithWarning('/app', 'Nemate ovlasti');
  }

  const orgs = await db.orgTable.findMany({
    where: { role: 'ORG' },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  });

  return json(orgs);
}

export default function Index() {
  const data = useAppLoader();

  const orgs = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-end gap-8 border-b p-2">
        <div className="text-center">{`${data.User.name} - ${data.User.role}@${data.User.Org.name}`}</div>
        <NavLink
          to={'/logout'}
          className={
            'flex items-center justify-center gap-2 rounded-full bg-red-100 px-4 py-2 font-bold text-red-500 hover:bg-red-200'
          }
        >
          <div>Odjava</div>
          <MdOutlineLogout />
        </NavLink>
      </header>

      <div className="flex flex-1 bg-white">
        {/**
         * SIDEBAR
         */}
        <aside className="flex w-52 flex-col gap-8 border-r pt-2">
          <NavLink
            to="register"
            className="m-2 self-start rounded border border-blue-500 px-4 py-1 text-zinc-900"
          >
            + Dodaj organizaciju
          </NavLink>

          <div className="flex flex-col">
            {orgs?.map((org) => (
              <NavLink
                key={org.id}
                to={`${org.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 truncate px-4 py-2 font-semibold hover:bg-blue-200 ${isActive ? 'bg-blue-100' : ''}`
                }
              >
                <div
                  className={`size-4 rounded-full ${statusClass[org.status]} `}
                />
                {org.name}
              </NavLink>
            ))}
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
