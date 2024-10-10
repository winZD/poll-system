import { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/react';
import * as zod from 'zod';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { jsonWithError, redirectWithSuccess } from 'remix-toast';
import { db } from '~/db';
import InputField from '~/components/Form/FormInput';
import { HookForm } from '~/components/Form/Form';
import { statusValues } from '~/components/models';
import { createHeaderCookies, createNewTokens } from '~/auth';
import i18next from '~/i18n.server';
import { parse } from 'cookie';
import { useTranslation } from 'react-i18next';

const schema = zod.object({
  email: zod.string().min(1),
  password: zod.string().min(1),
});

type FormData = zod.infer<typeof schema>;

export const action = async ({ request }: ActionFunctionArgs) => {
  const localeFromReq = await i18next.getLocale(request);

  const cookieHeader = request.headers.get('Cookie') || '';

  const cookies = parse(cookieHeader);

  const locale = cookies['lng'] ? cookies['lng'] : localeFromReq;

  const t = await i18next.getFixedT(locale);

  const schema = zod.object({
    email: zod.string().min(1, t('validUsername')),
    password: zod.string().min(1, t('validPassword')),
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
    return jsonWithError({ errors, defaultValues }, t('incorrectData'));
  }

  if (!data) {
    return jsonWithError(null, t('incorrectData'), {
      status: 401,
    });
  }

  const user = await db.userTable.findFirst({
    where: {
      email: data.email,
    },
    include: { Org: true },
  });
  if (!user) {
    return jsonWithError(null, t('noUser'), {
      status: 401,
    });
  }
  if (user.status !== statusValues.ACTIVE) {
    return jsonWithError(null, t('inactiveUser'), {
      status: 401,
    });
  }

  const isValid = true;
  // const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) {
    return jsonWithError(null, t('incorrectPassword'), { status: 401 });
  }

  const { accessToken, refreshToken } = await createNewTokens(user.id);

  const headers = createHeaderCookies(accessToken, refreshToken);

  return redirectWithSuccess(
    user.Org.role === 'ADMIN' ? '/app/admin' : `/app/org/${user.orgId}/polls`,
    t('successfulLogin'),
    {
      headers,
    },
  );
};

export default function Login() {
  const { t } = useTranslation();
  const formMethods = useRemixForm<FormData>({
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
    stringifyAllValues: true,
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
          {t('login')}
        </button>
      </HookForm>
    </div>
  );
}
