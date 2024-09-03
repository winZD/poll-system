import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, Outlet } from '@remix-run/react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  return json({});
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  return <div className="flex flex-col"></div>;
}
