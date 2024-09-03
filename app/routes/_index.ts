import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { decodeTokenFromRequest } from '~/utils';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');

  if (ctx.userOrgRole === 'ORG') {
    return redirect(`/org/${ctx.userOrgId}`, {
      ...(ctx.headers ? { headers: ctx.headers } : {}),
    });
  }

  if (ctx.userOrgRole === 'ADMIN') {
    return redirect(`/admin`, {
      ...(ctx.headers ? { headers: ctx.headers } : {}),
    });
  }

  throw new Response('Not Found', { status: 404 });
}
