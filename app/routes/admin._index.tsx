import { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  return redirect('active-orgs');
}
