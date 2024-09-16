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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Extracts the toast from the request
  const { toast = null, headers } = await getToast(request);
  // Important to pass in the headers so the toast is cleared properly
  return json({ toast }, { headers });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { toast } = useLoaderData<typeof loader>();

  React.useEffect(() => {
    if (toast) {
      // Call your toast function here
      notify(toast.message, { type: toast.type, position: 'top-center' });
    }
  }, [toast]);

  return (
    <html lang="en" className="h-full w-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="mx-auto flex h-full max-w-[1440px] flex-col">
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
