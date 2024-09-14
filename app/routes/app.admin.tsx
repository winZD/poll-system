import { LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet } from '@remix-run/react';
import { MdOutlineLogout } from 'react-icons/md';
import { redirectWithWarning } from 'remix-toast';
import { getUserFromRequest } from '~/auth';
import { roleValues } from '~/components/models';
import { useAppLoader } from '~/loaders';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const user = await getUserFromRequest(request);
  if (user?.Org.role === roleValues.USER) {
    return redirectWithWarning('/app', 'Nemate ovlasti');
  }
  return null;
}

export default function Index() {
  const data = useAppLoader();

  return (
    <div className="flex flex-1 flex-col">
      {/**
       * HEADER
       */}
      <header className="flex items-center justify-end gap-8 border p-2">
        <div className="text-center">{data.User.name}</div>
        <NavLink
          to={'/logout'}
          className={
            'flex items-center justify-center gap-2 rounded px-2 py-1 font-bold text-red-500 hover:bg-red-100'
          }
        >
          <div>Odjava</div>
          <MdOutlineLogout />
        </NavLink>
      </header>
      <div className="flex flex-1 bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
}
