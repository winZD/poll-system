import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from '@remix-run/react';
import React from 'react';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  const activeOrgs = await db.orgTable.findMany({
    where: { status: 'ACTIVE', role: 'ORG' },
  });

  return json(activeOrgs);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  React.useEffect(() => {}, []);

  const orgs = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex flex-col gap-2 border-r">
        <NavLink
          to="register"
          className="m-2 self-start rounded bg-blue-500 px-4 py-1 text-white"
        >
          + Dodaj organizaciju
        </NavLink>

        <div className="flex flex-col">
          {orgs?.map((org) => (
            <NavLink
              to={`${org.id}`}
              className={({ isActive }) =>
                `flex items-center p-2 hover:bg-blue-200 ${isActive ? 'bg-blue-100' : ''}`
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
