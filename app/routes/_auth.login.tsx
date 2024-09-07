import { ActionFunctionArgs } from '@remix-run/node';
import { Form, json, redirect, useActionData } from '@remix-run/react';
import * as zod from 'zod';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';

import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';
import { serialize } from 'cookie';
import { zodResolver } from '@hookform/resolvers/zod';
import { jsonWithError } from 'remix-toast';
import { addDays, addMinutes, addMonths } from 'date-fns';
import { db } from '~/db';
import InputField from '~/components/Form/FormInput';
import { FormProvider } from 'react-hook-form';
import { HookForm } from '~/components/Form/Form';
import bcrypt from 'bcryptjs';
import { statusValues } from '~/components/models';
import { generateAccessToken, generateRefreshToken } from '~/auth';

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

  if (errors) {
    // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
    return jsonWithError({ errors, defaultValues }, 'Neispravni podaci');
  }

  if (!data) {
    return jsonWithError(null, 'Neispravni podaci', {
      status: 401,
    });
  }

  const user = await db.userTable.findFirst({
    where: {
      email: data.email,
    },
    include: { Org: true },
  });
  // console.log({ user });
  if (!user) {
    return jsonWithError(null, 'Nepostojeći korisnik', {
      status: 401,
    });
  }
  if (user.status !== statusValues.ACTIVE) {
    return jsonWithError(null, 'Neaktivan korisnik', {
      status: 401,
    });
  }

  const isValid = true;
  // const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) {
    return jsonWithError(null, 'Neispravna lozinka', { status: 401 });
  }

  const tokenId = ulid();
  const accessToken = generateAccessToken({
    tokenId,
    userId: user.id,
  });
  const refreshToken = generateRefreshToken({
    tokenId,
    userId: user.id,
  });

  await db.refreshTokenTable.create({
    data: {
      id: tokenId,
      userId: user.id,
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 30),
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
      expires: addDays(new Date(), 30),
    }),
  );

  return redirect(user.Org.role === 'ADMIN' ? '/admin' : `/org/${user.orgId}`, {
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

        <button type="submit" className="rounded bg-slate-200 p-4">
          Prijavi se
        </button>
      </HookForm>
    </div>
  );
}
