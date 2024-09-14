import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import React from 'react';
import { statusClass } from '~/components/models';
import { db } from '~/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  const orgs = await db.orgTable.findMany({
    where: { role: 'ORG' },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  });

  return json(orgs);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  React.useEffect(() => {}, []);

  const orgs = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex w-52 flex-col gap-8 border-r">
        <NavLink
          to="register"
          className="m-2 self-start rounded bg-blue-500 px-4 py-1 text-white"
        >
          + Dodaj organizaciju
        </NavLink>

        <aside className="flex flex-col">
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
        </aside>
      </div>
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
