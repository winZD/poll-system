import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, NavLink, Outlet } from '@remix-run/react';
import { MdOutlineLogout } from 'react-icons/md';
import { redirectWithWarning } from 'remix-toast';
import { getUserFromRequest } from '~/auth';
import { roleValues } from '~/components/models';
import { useAppLoader } from '~/loaders';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);
  if (user?.Org.role === roleValues.ADMIN) {
    return redirectWithWarning('/app', 'Nemate ovlasti');
  }
  return null;
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const { User } = useAppLoader();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-end gap-8 border px-8 py-2">
        <NavLink
          to={`users/${User.id}`}
          className="rounded-full bg-slate-100 px-4 py-2 text-center hover:bg-slate-200"
        >{`${User.name}@${User.role} - ${User.Org?.name}`}</NavLink>
        <NavLink
          to={'/logout'}
          className={
            'flex items-center justify-center gap-2 rounded-full bg-red-100 px-4 py-2 font-bold text-red-500 hover:bg-red-200'
          }
        >
          <div>Odjava</div>
          <MdOutlineLogout />
        </NavLink>
      </header>
      <div className="flex flex-1">
        <aside className="flex w-52 flex-col border bg-slate-50">
          <NavLink
            to={'polls'}
            className={({ isActive }) => `p-4 ${isActive ? 'bg-blue-100' : ''}`}
          >
            Ankete
          </NavLink>
          <NavLink
            to={'users'}
            className={({ isActive }) => `p-4 ${isActive ? 'bg-blue-100' : ''}`}
          >
            Korisnici
          </NavLink>
        </aside>
        <div className="flex flex-1 bg-slate-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
