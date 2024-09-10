import { LoaderFunctionArgs, redirect } from '@remix-run/node';

import { decodeTokenFromRequest } from '~/auth';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const ctx = await decodeTokenFromRequest(request);

  if (!ctx?.User) return redirect('/login');

  if (ctx.User.Org.role === 'ORG') {
    return redirect(`/org/${ctx.User.orgId}`, {
      ...(ctx.headers ? { headers: ctx.headers } : {}),
    });
  }

  if (ctx.User.Org.role === 'ADMIN') {
    return redirect(`/admin`, {
      ...(ctx.headers ? { headers: ctx.headers } : {}),
    });
  }

  throw new Response('Not Found', { status: 404 });
}
