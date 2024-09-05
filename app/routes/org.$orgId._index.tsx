import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { json, Outlet } from '@remix-run/react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  return redirect('polls');
}
