import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, redirect } from "@remix-run/react";
import { db } from "~/utils/db";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  const user = await db.user.findUniqueOrThrow({ where: { id: "1" } });

  if (user.role !== "ADMIN") {
    redirect("/", {});
  }

  return json({});
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  return (
    <div className="flex flex-col">
      <div>header...</div>
      <div className="flex">
        <div>sidebar...</div>
        <Outlet />
      </div>
    </div>
  );
}
