import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  Outlet,
  redirect,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import React from "react";
import { db } from "~/utils/db";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return redirect("active-orgs");
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
