import {
  LoaderFunctionArgs,
  json,
  ActionFunctionArgs,
  redirect,
} from '@remix-run/node';
import { decodeTokenFromRequest } from '~/utils';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // TODO: decode token
  console.log(request.headers);
  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');

  //TODO: check if admin is logged in

  const activeOrgs = await db.pollTable.findMany({
    where: { orgId: '', userId: '' },
  });

  return json(activeOrgs);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  return <div className="text-red-700">Lista anketa</div>;
}
