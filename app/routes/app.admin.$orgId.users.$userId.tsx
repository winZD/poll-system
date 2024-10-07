import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import SelectField from '~/components/Form/SelectForm';
import { db } from '~/db';
import { NavLink, useLoaderData } from '@remix-run/react';
import {
  jsonWithError,
  redirectWithError,
  redirectWithSuccess,
} from 'remix-toast';
import {
  roleOptions,
  roleSchema,
  roleValues,
  statusOptions,
  statusSchema,
  statusValues,
} from '~/components/models';
import { FormContent } from '~/components/Form/FormContent';
import PermissionsForm from '~/components/Form/PermissionsForm';
import { MdUpdate } from 'react-icons/md';
import { getUserFromRequest } from '~/auth';
import { useAppLoader } from '~/loaders';
import { useTranslation } from 'react-i18next';
import { parse } from 'cookie';
import i18next from '~/i18n.server';

const schema = zod.object({
  name: zod.string().min(1, 'Obvezan podatak'),
  role: roleSchema.default('ADMIN'),
  status: statusSchema.default('ACTIVE'),
  permissions: zod.string().default(''),
});
type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, userId } = params;

  const localeFromReq = await i18next.getLocale(request);

  const cookieHeader = request.headers.get('Cookie') || '';

  const cookies = parse(cookieHeader);

  const locale = cookies['lng'] ? cookies['lng'] : localeFromReq;

  const t = await i18next.getFixedT(locale);

  const ctxUser = await getUserFromRequest(request);

  const user = await db.userTable.findUnique({
    where: { orgId: orgId, id: userId },
  });

  if (!user) return redirectWithError('..', t('noUser'));

  if (ctxUser?.role === roleValues.ADMIN || ctxUser?.id === userId) {
    return json(user);
  } else {
    return redirectWithError('..', t('noAuthority'));
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  const localeFromReq = await i18next.getLocale(request);

  const cookieHeader = request.headers.get('Cookie') || '';

  const cookies = parse(cookieHeader);

  const locale = cookies['lng'] ? cookies['lng'] : localeFromReq;

  const t = await i18next.getFixedT(locale);

  if (errors) {
    // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
    return jsonWithError({ errors, defaultValues }, t('incorrectData'));
  }

  const { orgId, userId } = params;
  await db.userTable.update({
    where: { orgId, id: userId },
    data: {
      ...data,
    },
  });

  return redirectWithSuccess('..', t('userUpdated'));
};

export default function Index() {
  const user = useLoaderData<typeof loader>();

  const { t } = useTranslation();

  const ctx = useAppLoader();

  const isAdmin = ctx.User.role === roleValues.ADMIN;

  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      ...user,
      status: user?.status as any,
      role: user?.role as any,
    },
  });

  return (
    <Modal title={t('updateUser')}>
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="PUT"
      >
        <FormContent>
          <InputField label={t('email')} name="email" readOnly />
          <InputField label={t('username')} name="name" />
          {isAdmin && (
            <>
              <SelectField label={t('role')} name="role" data={roleOptions} />
              <SelectField
                label={t('status')}
                name="status"
                data={statusOptions.filter(
                  (e) => e.value !== statusValues.DRAFT,
                )}
              />
            </>
          )}

          <PermissionsForm disabled={!isAdmin} />
          <NavLink
            to="change-password"
            className="flex items-center gap-2 self-end border p-2"
          >
            <MdUpdate />
            {t('changePassword')}
          </NavLink>

          <button
            type="submit"
            className="rounded bg-slate-200 p-2 hover:bg-slate-300"
          >
            {t('updateUser')}
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
}
