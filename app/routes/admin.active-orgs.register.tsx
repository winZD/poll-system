import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import React from "react";
import { Modal } from "~/components/Modal";
import { db } from "~/utils/db";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  // const users = await db.userTable.findMany({ where: { status: "ACTIVE" } });

  return json({});
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  React.useEffect(() => {}, []);

  const data = useLoaderData<typeof loader>();

  return (
    <Modal title="Novi korisnik/organizacija">
      <div>Nekakva forma za registraciju</div>
    </Modal>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
