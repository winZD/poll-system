import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useParams,
} from '@remix-run/react';
import { MdOutlineLogout } from 'react-icons/md';
import { decodeTokenFromRequest } from '~/utils';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');

  const user = await db.userTable.findUniqueOrThrow({
    where: { id: ctx?.userId },
    include: { Org: true },
  });
  const { orgId } = params;
  if (user.Org.role !== 'ORG' || user.orgId !== orgId) {
    redirect('/', {});
  }

  return json({ userName: ctx?.userName, orgId: ctx.userOrgId });
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const location = useLocation();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-end gap-8 border p-2">
        <div>{`ORGANIZATION: ${data.userName}`}</div>
      </div>
      <div className="flex flex-1">
        <div className="flex w-52 flex-col border bg-slate-50">
          <div className="flex flex-1 flex-col">
            <NavLink
              to={`../org/${params?.orgId}`}
              className={({ isActive }) =>
                `p-4 hover:bg-blue-200 ${isActive && location?.pathname === `/org/${params?.orgId}` ? 'bg-blue-100' : ''}`
              }
            >
              Organizacija
            </NavLink>
            <NavLink
              to={'polls'}
              className={({ isActive }) =>
                `p-4 ${isActive ? 'bg-blue-100' : ''}`
              }
            >
              Anketa
            </NavLink>
          </div>

          <NavLink
            to={'/logout'}
            className={
              'flex items-center justify-center gap-2 p-2 font-bold text-red-500 hover:bg-red-100'
            }
          >
            <div>Odjava</div>
            <MdOutlineLogout />
          </NavLink>
        </div>
        <div className="flex flex-1 bg-slate-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
