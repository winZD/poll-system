// app/routes/logout.js or .ts
import { redirect } from '@remix-run/node';
import { db } from '~/db';
import { parse } from 'cookie';
import { createHeaderCookies, verifyToken } from '~/auth';

export async function loader({ request }) {
  const cookies = parse(request.headers.get('Cookie') ?? '');

  const at = verifyToken(cookies['at']);

  if (at?.tokenId) {
    const refreshToken = await db.refreshTokenTable.findUnique({
      where: { id: at.tokenId },
    });
    if (refreshToken) {
      await db.refreshTokenTable.updateMany({
        where: { familyId: refreshToken?.familyId },
        data: { status: 'REVOKED' },
      });
    }
  }
  const headers = createHeaderCookies('', '');

  return redirect('/login', { headers });
}
