import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { decodeTokenFromRequest } from '~/utils';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const ctx = await decodeTokenFromRequest(request);

  console.log({ ctx });

  if (!ctx) return redirect('/login');

  if (ctx.userRole === 'ORG') {
    return redirect(`/org/${ctx.userId}`);
  }
  if (ctx.userRole === 'ADMIN') {
    return redirect(`/admin`);
  }

  throw new Response('Not Found', { status: 404 });
}
