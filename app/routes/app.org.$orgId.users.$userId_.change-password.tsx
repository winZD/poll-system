import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import { db } from '~/db';
import {
  jsonWithError,
  redirectWithError,
  redirectWithSuccess,
} from 'remix-toast';
import { roleValues } from '~/components/models';
import { FormContent } from '~/components/Form/FormContent';
import { getUserFromRequest, hashPassword } from '~/auth';
import { useTranslation } from 'react-i18next';

const schema = zod.object({
  newPassword: zod.string().min(3, 'Obvezan podatak'),
});
type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, userId } = params;

  const user = await getUserFromRequest(request);

  if (!(user?.role === roleValues.ADMIN || user?.id === userId)) {
    return redirectWithError('..', 'Nemate ovlasti');
  }

  return json(null);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  if (errors) {
    // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
    return jsonWithError({ errors, defaultValues }, 'Neispravni podaci');
  }

  const { orgId, userId } = params;

  const password = await hashPassword(data.newPassword);

  await db.userTable.update({
    where: { orgId, id: userId },
    data: {
      password,
    },
  });

  return redirectWithSuccess('..', 'Uspješno ste ažurirali lozinku');
};

export default function Index() {
  const { t } = useTranslation();
  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    defaultValues: {
      newPassword: '',
    },
  });

  return (
    <Modal title={t('updatePassword')}>
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="PUT"
      >
        <FormContent>
          <InputField label={t('newPassword')} name="newPassword" />

          <button
            type="submit"
            className="rounded bg-slate-200 p-2 hover:bg-slate-300"
          >
            {t('updatePassword')}
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
}
