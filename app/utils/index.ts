import { parse } from 'cookie';
import { addDays, addMinutes, addMonths, addSeconds } from 'date-fns';
import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';
import { serialize } from 'cookie';
import { db } from './db';
import bcrypt from 'bcryptjs';

type TToken = {
  tokenId: string;
  userId: string;
  userRole: string;
  userName: string;
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
): Promise<{
  userId: string;
  userRole: string;
  userName: string;
  iat: number;
  exp: number;
  tokenId: string;
  headers?: Headers;
} | null> => {
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
    return { ...decoded };
  } else {
    try {
      decoded = jwt.verify(cookies['rt'], process.env.COOKIE_JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch (e) {
      //
    }

    if (decoded) {
      const oldRT = await db.refreshTokenTable.findUnique({
        where: { id: decoded.tokenId, status: 'GRANTED' },
      });

      if (!oldRT) return null;

      await db.refreshTokenTable.update({
        where: { id: decoded.tokenId },
        data: { status: 'REVOKED' },
      });

      const user = await db.userTable.findUniqueOrThrow({
        where: { id: decoded.userId },
      });

      const tokenId = ulid();
      const accessToken = generateAccessToken({
        tokenId,
        userId: decoded.userId,
        userRole: user.role,
        userName: user.name,
      });
      const refreshToken = generateRefreshToken({
        tokenId,
        userId: decoded.userId,
        userRole: user.role,
        userName: user.name,
      });
      await db.refreshTokenTable.create({
        data: {
          id: tokenId,
          userId: decoded.userId,
          createdAt: new Date(),
          expiresAt: addMonths(new Date(), 1),
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
          expires: addMonths(new Date(), 1),
        }),
      );

      return { ...decoded, headers };
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
