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
      notify(toast.message, { type: toast.type });
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
      <body className="flex h-full w-full flex-col">
        {children}
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
