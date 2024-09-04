import {
  LoaderFunctionArgs,
  json,
  ActionFunctionArgs,
  redirect,
} from '@remix-run/node';
import { NavLink, Outlet, useLoaderData, useParams } from '@remix-run/react';
import { decodeTokenFromRequest } from '~/utils';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');

  const polls = await db.pollTable.findMany({
    where: { orgId: ctx?.userOrgId },
  });
  console.log(ctx);
  return json(polls);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const params = useParams();
  console.log(params);
  const polls = useLoaderData<typeof loader>();
  console.log(polls);
  return (
    <>
      <div>
        <div className="flex gap-2 border-r">
          <NavLink
            to="create"
            className="m-2 self-start rounded bg-blue-500 px-4 py-1 text-white"
          >
            + Dodaj anketu
          </NavLink>
        </div>
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="max-w-md rounded-lg bg-slate-100 text-slate-800 shadow-md"
          >
            <div className="grid grid-flow-col grid-rows-2 gap-4 p-5">
              <span>{poll.name}</span>
              <span>{poll.status}</span>
              <span>{poll.createdAt.toString()}</span>
              <span>{poll.expiresAt.toString()}</span>
            </div>
          </div>
        ))}
        <Outlet />
      </div>
    </>
  );
}
