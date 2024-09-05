// app/routes/logout.js or .ts
import { createCookie, redirect } from '@remix-run/node';
import { serialize } from 'cookie';
import { db, decodeTokenFromRequest } from '~/db';

export async function loader({ request }) {
  const ctx = await decodeTokenFromRequest(request);
  if (ctx?.tokenId) {
    const rt = await db.refreshTokenTable.findUnique({
      where: { id: ctx.tokenId },
    });
    if (rt) {
      await db.refreshTokenTable.updateMany({
        where: { familyId: rt?.familyId },
        data: { status: 'REVOKED' },
      });
    }
  }

  let headers = new Headers();

  headers.append(
    'Set-Cookie',
    serialize('at', '', {
      path: '/',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
      // expires: addDays(new Date(), 1),
      expires: new Date(0),
    }),
  );
  headers.append(
    'Set-Cookie',
    serialize('rt', '', {
      path: '/',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
      expires: new Date(0),
    }),
  );

  return redirect('/login', { headers });
}
