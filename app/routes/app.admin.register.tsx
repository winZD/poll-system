import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { json } from '@remix-run/react';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import { ulid } from 'ulid';
import { db } from '~/db';
import { hashPassword } from '~/auth';
import { useTranslation } from 'react-i18next';
import i18next from '~/i18n.server';
import { parse } from 'cookie';

const schema = zod.object({
  name: zod.string().min(1),
  email: zod.string().email().min(1),
  password: zod.string().min(1),
});

type FormData = zod.infer<typeof schema>;

export async function loader({ request, params }: LoaderFunctionArgs) {
  return json({});
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const localeFromReq = await i18next.getLocale(request);

  const cookieHeader = request.headers.get('Cookie') || '';

  const cookies = parse(cookieHeader);

  const locale = cookies['lng'] ? cookies['lng'] : localeFromReq;

  const t = await i18next.getFixedT(locale);

  const schema = zod.object({
    name: zod.string().min(1, t('requiredData')),
    email: zod.string().email(t('incorrectEmail')).min(1, t('requiredData')),
    password: zod.string().min(1, t('requiredData')),
  });
  type FormData = zod.infer<typeof schema>;
  const resolver = zodResolver(schema);
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
  return redirect(`../${org.id}`);
};
export default function Index() {
  const { t } = useTranslation();
  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
  });

  return (
    <Modal title={t('newOrganization')}>
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="POST"
        className="flex w-96 flex-col gap-4 p-4"
      >
        <InputField label={t('email')} name="email" />
        <InputField label={t('name')} name="name" />
        <InputField label={t('initialPassword')} name="password" />

        <button
          type="submit"
          className="rounded bg-slate-200 p-2 hover:bg-slate-300"
        >
          {t('registerNewOrg')}
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
