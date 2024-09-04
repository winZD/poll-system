import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import React from 'react';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  const orgs = await db.orgTable.findMany({
    where: { status: 'INACTIVE', role: 'ORG' },
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
      <div className="flex w-52 flex-col items-stretch border-r">
        {orgs?.map((org) => (
          <NavLink
            to={`${org.id}`}
            className={({ isActive }) =>
              `flex items-center truncate p-2 font-semibold hover:bg-blue-200 ${isActive ? 'bg-blue-100' : ''}`
            }
          >
            {org.name}
          </NavLink>
        ))}
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
