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

  const users = await db.userTable.findMany({
    where: { status: 'ACTIVE', role: 'ORG' },
  });

  return json(users);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  React.useEffect(() => {}, []);

  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-2">
      <NavLink
        to="register"
        className="self-start rounded-lg bg-blue-500 p-2 text-white"
      >
        + Dodaj korisnika
      </NavLink>

      <div>Lista aktivnih korisnika</div>

      <div className="flex max-w-2xl flex-col">
        {data?.map((e) => (
          <NavLink
            to={`../org/${e.id}`}
            className="flex items-center bg-zinc-200 p-2"
          >
            <div className="flex-1">{e.name}</div>
            <div className="flex-1">{e.email}</div>
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
