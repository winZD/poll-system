import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from '@remix-run/react';
import React from 'react';
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

  const activeOrgs = orgs.filter((org) => org.status === 'ACTIVE');
  const inactiveOrgs = orgs.filter((org) => org.status === 'INACTIVE');

  return (
    <>
      <div className="flex w-52 flex-col gap-8 border-r">
        <NavLink
          to="register"
          className="m-2 self-start rounded bg-blue-500 px-4 py-1 text-white"
        >
          + Dodaj organizaciju
        </NavLink>

        <div className="flex flex-col">
          {activeOrgs?.map((org) => (
            <NavLink
              key={org.id}
              to={`${org.id}`}
              className={({ isActive }) =>
                `flex items-center truncate p-2 font-semibold hover:bg-blue-200 ${isActive ? 'bg-blue-100' : ''}`
              }
            >
              {org.name}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-col">
          {inactiveOrgs?.map((org) => (
            <NavLink
              key={org.id}
              to={`${org.id}`}
              className={({ isActive }) =>
                `flex items-center truncate p-2 font-semibold text-red-500 hover:bg-red-200 ${isActive ? 'bg-red-100' : ''}`
              }
            >
              {org.name}
            </NavLink>
          ))}
        </div>
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
