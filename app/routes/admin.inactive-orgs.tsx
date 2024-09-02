import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import React from "react";
import { db } from "~/utils/db";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  // const users = await db.userTable.findMany({ where: { status: "INACTIVE" } });

  return json({});
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  React.useEffect(() => {}, []);

  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      Neaktivni korisnici
      {/* {data.map((e) => (
        <div>{e.name}</div>
      ))} */}
    </div>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
