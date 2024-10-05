import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  useLoaderData,
  useSubmit,
} from '@remix-run/react';
import {
  MdOutlineLogout,
  MdOutlinePoll,
  MdOutlineSupervisorAccount,
} from 'react-icons/md';
import { jsonWithSuccess, redirectWithWarning } from 'remix-toast';
import { getUserFromRequest } from '~/auth';
import { roleValues } from '~/components/models';
import { useAppLoader } from '~/loaders';
import { serialize } from 'cookie';

import { parse } from 'cookie';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import i18next from '~/i18n.server';
import i18n from '~/i18n';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);
  if (user?.Org.role === roleValues.ADMIN) {
    return redirectWithWarning('/app', 'Nemate ovlasti');
  }
  // Get the 'lng' cookie from the request
  const cookieHeader = request.headers.get('Cookie');
  const cookies = await parse(cookieHeader || '');
  const lng = cookies.lng || (await i18next.getLocale(request));
  return json({ lng });
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
      maxAge: 365 * 24 * 60 * 60, // 1 year in seconds (31,536,000 seconds)
    }),
  );

  return json({}, { headers });
};

export default function Index() {
  const { User } = useAppLoader();
  const { lng } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const { t } = useTranslation();

  return (
    <div className="flex w-[1280px] flex-1 flex-col self-center">
      <header className="flex items-center justify-end gap-8 border-b p-2">
        <div className="flex items-center rounded-md border border-gray-300 shadow-sm hover:bg-gray-300">
          {i18n.supportedLngs.map((lang) => (
            <button
              key={lang}
              className={`px-3 py-1 ${
                lang === lng
                  ? 'rounded-md bg-blue-500 text-white hover:bg-blue-800'
                  : 'text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() =>
                submit({ language: lang }, { method: 'post', navigate: false })
              }
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
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
          <div>{t('logout')}</div>
          <MdOutlineLogout />
        </NavLink>
      </header>
      <div className="flex flex-1">
        <aside className="flex w-52 flex-col border-r">
          <NavLink
            to={'polls'}
            className={({ isActive }) => `p-4 ${isActive ? 'bg-blue-100' : ''}`}
          >
            <div className="flex items-center gap-x-2">
              <MdOutlinePoll size={20} />
              {t('polls')}
            </div>
          </NavLink>
          <NavLink
            to={'users'}
            className={({ isActive }) => `p-4 ${isActive ? 'bg-blue-100' : ''}`}
          >
            <div className="flex items-center gap-x-2">
              <MdOutlineSupervisorAccount size={20} />
              {t('users')}
            </div>
          </NavLink>
        </aside>
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
