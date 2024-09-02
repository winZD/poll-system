import { ActionFunctionArgs } from '@remix-run/node';
import { Form, json, redirect, useActionData } from '@remix-run/react';
import * as zod from 'zod';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';

import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';
import { serialize } from 'cookie';
import { zodResolver } from '@hookform/resolvers/zod';
import { jsonWithError } from 'remix-toast';
import { db } from '~/utils/db';
import { addDays, addMinutes, addMonths } from 'date-fns';
import { generateAccessToken, generateRefreshToken } from '~/utils';

const schema = zod.object({
  email: zod.string().min(1, 'Upišite ispravno korisničko ime'),
  password: zod.string().min(1, 'Upišite ispravno lozinku'),
});

const resolver = zodResolver(schema);
type FormData = zod.infer<typeof schema>;

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  if (!data) {
    return jsonWithError(null, 'Neispravni podaci', {
      status: 401,
    });
  }

  const user = await db.userTable.findFirst({
    where: {
      email: data.email,
    },
  });
  // console.log({ user });
  if (!user) {
    return jsonWithError(null, 'Nepostojeći korisnik', {
      status: 401,
    });
  }

  const isValid = true;
  // const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) {
    return jsonWithError(null, 'Neispravna lozinka', { status: 401 });
  }
  // console.log({ user });
  const tokenId = ulid();
  const accessToken = generateAccessToken({
    tokenId,
    userId: user.id,
    userRole: user.role,
  });
  const refreshToken = generateRefreshToken({
    tokenId,
    userId: user.id,
    userRole: user.role,
  });
  await db.refreshTokenTable.create({
    data: {
      id: tokenId,
      userId: user.id,
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 7),
      familyId: tokenId,
      token: refreshToken,
      status: 'GRANTED',
    },
  });

  let headers = new Headers();
  headers.append(
    'Set-Cookie',
    serialize('at', accessToken, {
      path: '/',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
      expires: addMinutes(new Date(), 30),
    }),
  );
  headers.append(
    'Set-Cookie',
    serialize('rt', refreshToken, {
      path: '/',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
      expires: addDays(new Date(), 7),
    }),
  );

  return redirect(user.role === 'ADMIN' ? '/admin' : `/org/${user.id}`, {
    headers,
  });
};

export default function Login() {
  const formMethods = useRemixForm<FormData>({
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
    stringifyAllValues: true,
    resolver: resolver,
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = formMethods;

  const actionData = useActionData<{ error: string }>();

  return (
    <div className="flex h-full w-full justify-center">
      <Form
        onSubmit={handleSubmit}
        method="POST"
        className="flex w-96 flex-col gap-4 p-4"
      >
        <label className="flex justify-between gap-2">
          Email:
          <input
            autoComplete="off"
            className="rounded outline-none"
            type="text"
            {...register('email')}
          />
          {errors.email && <p>{errors.email.message}</p>}
        </label>
        <label className="flex justify-between gap-2">
          Lozinka:
          <input
            autoComplete="off"
            type="text"
            className="rounded outline-none"
            {...register('password')}
          />
          {errors.password && <p>{errors.password.message}</p>}
        </label>

        <button type="submit" className="rounded bg-zinc-200 p-4">
          Prijavi se
        </button>
      </Form>
    </div>
  );
}
