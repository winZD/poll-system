import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import './tailwind.css';
import { LoaderFunctionArgs } from '@remix-run/node';
import { getToast } from 'remix-toast';
import React from 'react';
import { ToastContainer, toast as notify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DialogProvider } from './components/Dialog';
import i18next from './localization/i18n.server';
import { useTranslation } from 'react-i18next';
import { useChangeLanguage } from 'remix-i18next/react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let locale = await i18next.getLocale(request);
  // Extracts the toast from the request
  const { toast = null, headers } = await getToast(request);
  // Important to pass in the headers so the toast is cleared properly
  return json({ toast, locale }, { headers });
};
export let handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: 'common',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { toast, locale } = useLoaderData<typeof loader>();

  let { i18n } = useTranslation();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);

  React.useEffect(() => {
    if (toast) {
      // Call your toast function here
      notify(toast.message, { type: toast.type, position: 'top-center' });
    }
  }, [toast]);

  return (
    <html lang={locale} dir={i18n.dir()} className="h-full w-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="mx-auto flex h-full max-w-[1440px] flex-col border-x border-b">
        <DialogProvider>{children}</DialogProvider>
        <ScrollRestoration />
        <Scripts />
        <ToastContainer />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error('Global error caught by ErrorBoundary:', error); // Log for debugging

  return (
    <html>
      <head>
        <Meta />
        <title>Application Error</title>
      </head>
      <body>
        <h1>Something went wrong</h1>
        <p>{error?.message?.toString()}</p>
        <p>Sorry, an unexpected error has occurred. Please try again later.</p>
        <Scripts />{' '}
        {/* Keep the Scripts component to ensure the app continues working */}
      </body>
    </html>
  );
}
