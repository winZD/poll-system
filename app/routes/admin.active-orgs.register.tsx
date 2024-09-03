import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { Form, json, useLoaderData } from '@remix-run/react';
import React from 'react';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import { db } from '~/utils/db';
import { ulid } from 'ulid';
import { hashPassword } from '~/utils';

const schema = zod.object({
  name: zod.string().min(1),
  email: zod.string().email('Neispravan email').min(1),
  password: zod.string().min(1),
});

type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  // const users = await db.userTable.findMany({ where: { status: "ACTIVE" } });

  return json({});
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);
  if (errors) {
    // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
    return json({ errors, defaultValues });
  }

  const password = await hashPassword(data.password);

  const org = await db.orgTable.create({
    data: {
      id: ulid(),
      email: data.email,
      name: data.name,
      role: 'ORG',
    },
  });
  await db.userTable.create({
    data: {
      id: ulid(),
      orgId: org.id,
      email: data.email,
      name: data.name,
      role: 'ADMIN',
      password,
      permissions: 'CRUD',
    },
  });

  // Do something with the data
  return redirect(`..`);
};
export default function Index() {
  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    resolver,
  });

  return (
    <Modal title="Novi korisnik">
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="POST"
        className="flex w-96 flex-col gap-4 p-4"
      >
        <InputField label="Email" name="email" />
        <InputField label="Naziv" name="name" />
        <InputField label="Inicijalna lozinka" name="password" />

        <button type="submit" className="rounded bg-zinc-200 p-2">
          Registriraj novog korisnika
        </button>
      </HookForm>
    </Modal>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
