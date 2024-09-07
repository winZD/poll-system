import {
  LoaderFunctionArgs,
  json,
  ActionFunctionArgs,
  redirect,
} from '@remix-run/node';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import SelectField from '~/components/Form/SelectForm';
import { db, decodeTokenFromRequest } from '~/db';
import { useLoaderData } from '@remix-run/react';
import {
  jsonWithError,
  redirectWithError,
  redirectWithSuccess,
} from 'remix-toast';
import {
  roleOptions,
  roleSchema,
  statusOptions,
  statusSchema,
} from '~/components/models';
import { FormContent } from '~/components/Form/FormContent';
import PermissionsForm from '~/components/Form/PermissionsForm';

const schema = zod.object({
  name: zod.string().min(1, 'Obvezan podatak'),
  role: roleSchema.default('ADMIN'),
  status: statusSchema.default('ACTIVE'),
  permissions: zod.string().default(''),
});
type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  const ctx = await decodeTokenFromRequest(request);

  if (!ctx) return redirect('/login');

  const { orgId, userId } = params;

  const user = await db.userTable.findUnique({
    where: { orgId: orgId, id: userId },
  });

  if (!user) return redirectWithError('..', 'Nepostojeći korisnik');

  return json(user);
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
  await db.userTable.update({
    where: { orgId, id: userId },
    data: {
      ...data,
    },
  });

  return redirectWithSuccess('..', 'Uspješno ste ažurirali korisnika');
};

export default function Index() {
  const user = useLoaderData<typeof loader>();
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
    <Modal title="Ažuriraj korisnika">
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="PUT"
      >
        <FormContent>
          <InputField label="Ime korisnika" name="name" />
          <SelectField label="Uloga" name="role" data={roleOptions} />
          <SelectField label="Status" name="status" data={statusOptions} />
          <PermissionsForm />

          <button
            type="submit"
            className="rounded bg-slate-200 p-2 hover:bg-slate-300"
          >
            Ažuriraj korisnika
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
}
