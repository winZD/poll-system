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
import { decodeTokenFromRequest, hashPassword } from '~/auth';

const schema = zod.object({
  newPassword: zod.string().min(3, 'Obvezan podatak'),
});
type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, userId } = params;

  const ctx = await decodeTokenFromRequest(request);

  if (!(ctx?.User?.role === roleValues.ADMIN || ctx?.userId === userId)) {
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
  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    defaultValues: {
      newPassword: '',
    },
  });

  return (
    <Modal title="Ažuriraj lozinku">
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="PUT"
      >
        <FormContent>
          <InputField label="Nova lozinka" name="newPassword" />

          <button
            type="submit"
            className="rounded bg-slate-200 p-2 hover:bg-slate-300"
          >
            Ažuriraj lozinku
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
}
