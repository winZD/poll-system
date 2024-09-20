import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  useLoaderData,
  useSubmit,
} from '@remix-run/react';
import { MdOutlineLogout } from 'react-icons/md';
import { redirectWithWarning } from 'remix-toast';
import { getUserFromRequest } from '~/auth';
import { roleValues } from '~/components/models';
import { useAppLoader } from '~/loaders';
import { serialize } from 'cookie';

import i18n from '~/localization/i18n';
import { parse } from 'cookie';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);
  if (user?.Org.role === roleValues.ADMIN) {
    return redirectWithWarning('/app', 'Nemate ovlasti');
  }
  // Get the 'lng' cookie from the request
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parse(cookieHeader || '');
  const lng = cookies.lng;
  return { lng };
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const language = formData.get('language')?.toString() || '';

  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    serialize('lng', language, {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    }),
  );

  console.log(formData);

  return json({}, { headers });
};

export default function Index() {
  const { User } = useAppLoader();
  const { lng } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <div className="flex w-[1280px] flex-1 flex-col self-center">
      <header className="flex items-center justify-end gap-8 border-b p-2">
        <NavLink
          to={`users/${User.id}`}
          className="rounded-full bg-slate-100 px-4 py-2 text-center hover:bg-slate-200"
        >{`${User.name} - ${User.role}@${User.Org?.name}`}</NavLink>
        <NavLink
          to={'/logout'}
          className={
            'flex items-center justify-center gap-2 rounded-full bg-red-100 px-4 py-2 font-bold text-red-500 hover:bg-red-200'
          }
        >
          <div>Odjava</div>
          <MdOutlineLogout />
        </NavLink>
        <select
          className="rounded border-slate-200"
          onChange={(e) =>
            submit({ language: e.target.value }, { method: 'POST' })
          }
          value={lng}
        >
          {i18n.supportedLngs.map((option) => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </select>
      </header>
      <div className="flex flex-1">
        <aside className="flex w-52 flex-col border-r">
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
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
