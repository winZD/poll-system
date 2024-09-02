import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import React from "react";
import { db } from "~/utils/db";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  const users = await db.user.findMany({ where: { status: "ACTIVE" } });

  return json(users);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  React.useEffect(() => {}, []);

  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      {data.map((e) => (
        <div>{e.name}</div>
      ))}
    </div>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
