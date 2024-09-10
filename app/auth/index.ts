import { parse } from 'cookie';
import { addDays, addMinutes } from 'date-fns';
import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';

import { OrgTable, UserTable } from '@prisma/client';
import { db } from '~/db';

type TToken = {
  tokenId: string;
  userId: string;
};

export const generateAccessToken = (data: TToken) =>
  jwt.sign(data, process.env.COOKIE_JWT_SECRET, {
    // expiresIn: "5s",
    expiresIn: '30min',
  });

export const generateRefreshToken = (data: TToken) =>
  jwt.sign(data, process.env.COOKIE_JWT_SECRET, {
    expiresIn: '30d',
  });

export const decodeTokenFromRequest = async (
  request: Request,
): Promise<
  | (TToken & {
      iat: number;
      exp: number;
      User?: UserTable & { Org: OrgTable };
      headers?: Headers;
    })
  | null
> => {
  const cookies = parse(request.headers.get('Cookie') ?? '');

  let decoded;
  try {
    decoded = jwt.verify(cookies['at'], process.env.COOKIE_JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch (e) {
    //
  }

  if (decoded) {
    console.log('AT valid');
    const User = await db.userTable.findUnique({
      where: { id: decoded.userId },
      include: { Org: true },
    });
    return { ...decoded, User };
  } else {
    try {
      decoded = jwt.verify(cookies['rt'], process.env.COOKIE_JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch (e) {
      //
    }
    console.log('AT invalid');

    if (decoded) {
      const oldRT = await db.refreshTokenTable.findUnique({
        where: { id: decoded.tokenId, status: 'GRANTED' },
      });

      console.log('RT valid');

      if (!oldRT) {
        console.log('RefreshTokenTable invalid');
        return null;
      }

      console.log('RefreshTokenTable valid, generating new tokens');

      await db.refreshTokenTable.update({
        where: { id: decoded.tokenId },
        data: { status: 'REVOKED' },
      });

      const User = await db.userTable.findUnique({
        where: { id: decoded.userId },
        include: { Org: true },
      });

      const tokenId = ulid();
      const accessToken = generateAccessToken({
        tokenId,
        userId: decoded.userId,
      });
      const refreshToken = generateRefreshToken({
        tokenId,
        userId: decoded.userId,
      });
      await db.refreshTokenTable.create({
        data: {
          id: tokenId,
          userId: decoded.userId,
          createdAt: new Date(),
          expiresAt: addDays(new Date(), 30),
          familyId: oldRT.familyId,
          token: refreshToken,
          status: 'GRANTED',
        },
      });

      const headers = new Headers();
      headers.append(
        'Set-Cookie',
        serialize('at', accessToken, {
          path: '/',
          sameSite: 'lax',
          domain: process.env.COOKIE_DOMAIN,
          expires: addMinutes(new Date(), 30),
          // expires: addDays(new Date(), 1),
        }),
      );
      headers.append(
        'Set-Cookie',
        serialize('rt', refreshToken, {
          path: '/',
          sameSite: 'lax',
          domain: process.env.COOKIE_DOMAIN,
          expires: addDays(new Date(), 30),
        }),
      );

      return { ...decoded, headers, User };
    } else {
      return null;
    }
  }
};

export async function hashPassword(password) {
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Hashing failed');
  }
}
