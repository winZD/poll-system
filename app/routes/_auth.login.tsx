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
import InputField from '~/components/Form/FormInput';
import { FormProvider } from 'react-hook-form';
import { HookForm } from '~/components/Form/Form';

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
    userName: user.name,
  });
  const refreshToken = generateRefreshToken({
    tokenId,
    userId: user.id,
    userRole: user.role,
    userName: user.name,
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
  const { handleSubmit } = formMethods;

  const actionData = useActionData<{ error: string }>();

  return (
    <div className="flex h-full w-full items-center justify-center">
      <HookForm
        formMethods={formMethods}
        onSubmit={handleSubmit}
        method="POST"
        className="flex flex-col gap-4 rounded border p-8 shadow"
      >
        <InputField label="Email" name="email" />
        <InputField label="Lozinka" name="password" />

        <button type="submit" className="rounded bg-zinc-200 p-4">
          Prijavi se
        </button>
      </HookForm>
    </div>
  );
}
