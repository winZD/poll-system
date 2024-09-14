import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { parse } from 'cookie';
import { redirectWithError, redirectWithWarning } from 'remix-toast';

import {
  createNewTokens,
  revokeOldRefreshToken,
  createHeaderCookies,
  verifyToken,
} from '~/auth';
import { statusValues } from '~/components/models';
import { db } from '~/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  console.log('app.ts', params);

  const cookies = parse(request.headers.get('Cookie') ?? '');

  const at = verifyToken(cookies['at']);

  if (at) {
    const User = await db.userTable.findFirst({
      where: { id: at.userId },
      include: { Org: true },
    });

    if (User?.status === statusValues.ACTIVE) {
      return json({ User });
    } else {
      return redirectWithError('/login', 'Neaktivan korisnik');
    }
  } else {
    const rt = verifyToken(cookies['rt']);

    if (rt) {
      const User = await db.userTable.findFirst({
        where: { id: rt.userId },
        include: { Org: true },
      });

      if (User?.status === statusValues.ACTIVE) {
        await revokeOldRefreshToken(rt.tokenId);
        const { accessToken, refreshToken } = await createNewTokens(
          rt.userId,
          rt.tokenId,
        );
        const headers = await createHeaderCookies(accessToken, refreshToken);

        return json({ User }, { headers });
      } else {
        return redirectWithError('/login', 'Neaktivan korisnik');
      }
    } else {
      return redirectWithWarning('/login', 'Niste prijavljeni');
    }
  }
}