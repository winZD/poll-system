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
import { roleValues, statusClass } from '~/components/models';
import { db } from '~/db';
import i18n from '~/i18n';
import { useAppLoader } from '~/loaders';
import { serialize, parse } from 'cookie';
import { useTranslation } from 'react-i18next';
import i18next from '~/i18n.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Get the 'lng' cookie from the request
  const cookieHeader = request.headers.get('Cookie');
  const cookies = await parse(cookieHeader || '');
  const lng = cookies.lng || (await i18next.getLocale(request));
  const t = await i18next.getFixedT(lng);

  const user = await getUserFromRequest(request);
  if (user?.Org.role === roleValues.USER) {
    return redirectWithWarning('/app', t('noAuthority'));
  }

  const orgs = await db.orgTable.findMany({
    where: { role: 'ORG' },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  });

  return json({ orgs, lng });
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
  const data = useAppLoader();

  const submit = useSubmit();

  const { t } = useTranslation();

  const { orgs, lng } = useLoaderData<typeof loader>();

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
        <div className="text-center">{`${data.User.name} - ${data.User.role}@${data.User.Org.name}`}</div>
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

      <div className="flex flex-1 bg-white">
        {/**
         * SIDEBAR
         */}
        <aside className="flex w-52 flex-col gap-8 border-r pt-2">
          <NavLink
            to="register"
            className="m-2 self-start rounded border border-blue-500 px-4 py-1 text-zinc-900"
          >
            {'+ ' + t('addOrganization')}
          </NavLink>

          <div className="flex flex-col">
            {orgs?.map((org) => (
              <NavLink
                key={org.id}
                to={`${org.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 truncate px-4 py-2 font-semibold hover:bg-blue-200 ${isActive ? 'bg-blue-100' : ''}`
                }
              >
                <div
                  className={`size-4 rounded-full ${statusClass[org.status]} `}
                />
                {org.name}
              </NavLink>
            ))}
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
