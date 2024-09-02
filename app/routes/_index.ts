import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { decodeTokenFromRequest } from '~/utils';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');

  if (ctx.userRole !== 'ADMIN') {
    return redirect(`/org/${ctx.userId}`);
  }

  return redirect(`/admin`);
}
