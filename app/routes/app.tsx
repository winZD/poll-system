import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { parse } from 'cookie';
import { redirectWithError, redirectWithWarning } from 'remix-toast';

import {
  createNewTokens,
  revokeOldRefreshToken,
  createHeaderCookies,
  verifyToken,
} from '~/auth';
import { roleValues, statusValues } from '~/components/models';
import { db } from '~/db';
import i18next from '~/i18n.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const cookies = parse(request.headers.get('Cookie') ?? '');

  let localeFromReq = await i18next.getLocale(request);

  const locale = cookies['lng'] ? cookies['lng'] : localeFromReq;

  const t = await i18next.getFixedT(locale);

  const at = verifyToken(cookies['at']);

  if (at) {
    const User = await db.userTable.findFirst({
      where: { id: at.userId },
      include: { Org: true },
    });

    if (User?.status === statusValues.ACTIVE) {
      return json({
        User: {
          ...User,
          canCreate:
            User.permissions.includes('C') || User.role === roleValues.ADMIN,
          canUpdate:
            User.permissions.includes('U') || User.role === roleValues.ADMIN,
          canDelete:
            User.permissions.includes('D') || User.role === roleValues.ADMIN,
          canReadApi:
            User.permissions.includes('R') || User.role === roleValues.ADMIN,
        },
      });
    } else {
      return redirectWithError('/login', t('inactiveUser'));
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

        return json(
          {
            User: {
              ...User,
              canCreate:
                User.permissions.includes('C') ||
                User.role === roleValues.ADMIN,
              canUpdate:
                User.permissions.includes('U') ||
                User.role === roleValues.ADMIN,
              canDelete:
                User.permissions.includes('D') ||
                User.role === roleValues.ADMIN,
              canReadApi:
                User.permissions.includes('R') ||
                User.role === roleValues.ADMIN,
            },
          },
          { headers },
        );
      } else {
        return redirectWithError('/login', t('inactiveUser'));
      }
    } else {
      return redirectWithWarning('/login', t('notLoggedIn'));
    }
  }
}
