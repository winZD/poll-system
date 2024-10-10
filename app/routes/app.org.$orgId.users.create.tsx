import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import SelectField from '~/components/Form/SelectForm';
import { db } from '~/db';
import { jsonWithError, redirectWithSuccess } from 'remix-toast';
import {
  roleSchema,
  statusSchema,
  roleOptions,
  statusOptions,
  roleValues,
  statusValues,
} from '~/components/models';
import { ulid } from 'ulid';
import { FormContent } from '~/components/Form/FormContent';
import PermissionsForm from '~/components/Form/PermissionsForm';
import i18next from '~/i18n.server';
import { parse } from 'cookie';
import { useTranslation } from 'react-i18next';

const schema = zod.object({
  name: zod.string().min(1, 'Obvezan podatak'),
  email: zod.string().email('Obvezan podatak'),
  password: zod.string().min(1, 'Obvezan podatak'),
  role: roleSchema.default('ADMIN'),
  status: statusSchema.default('ACTIVE'),
  permissions: zod.string().default(''),
});

type FormData = zod.infer<typeof schema>;

export async function loader({ request, params }: LoaderFunctionArgs) {
  return json({});
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  let localeFromReq = await i18next.getLocale(request);

  const cookieHeader = request.headers.get('Cookie') || '';

  const cookies = parse(cookieHeader);

  const locale = cookies['lng'] ? cookies['lng'] : localeFromReq;

  const t = await i18next.getFixedT(locale);

  const schema = zod.object({
    name: zod.string().min(1, t('requiredData')),
    email: zod.string().email(t('incorrectEmail')),
    password: zod.string().min(1, t('requiredData')),
    role: roleSchema.default('ADMIN'),
    status: statusSchema.default('ACTIVE'),
    permissions: zod.string().default(''),
  });

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

  const orgId = params.orgId;
  if (orgId) {
    await db.userTable.create({
      data: { ...data, id: ulid(), orgId },
    });
    return redirectWithSuccess('..', {
      message: t('userCreated'),
    });
  }
};

const Index = () => {
  const { t } = useTranslation();

  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    defaultValues: {
      permissions: '',
      role: roleValues.USER,
      status: statusValues.ACTIVE,
    },
  });

  return (
    <Modal title={t('newUser')}>
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="POST"
      >
        <FormContent>
          <InputField label={t('email')} name="email" autoFocus />
          <InputField label={t('username')} name="name" />
          <InputField label={t('initialPassword')} name="password" />
          <SelectField label={t('role')} name="role" data={roleOptions} />
          <SelectField
            label={t('statusLabel')}
            name="status"
            data={statusOptions.filter((e) => e.value !== statusValues.DRAFT)}
          />

          <PermissionsForm />

          <button
            type="submit"
            className="rounded bg-slate-200 p-2 hover:bg-slate-300"
          >
            {t('addUser')}
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
};

export default Index;
