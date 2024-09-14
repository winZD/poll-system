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
} from '~/components/models';
import { FormContent } from '~/components/Form/FormContent';
import PermissionsForm from '~/components/Form/PermissionsForm';
import { MdUpdate } from 'react-icons/md';
import { getUserFromRequest } from '~/auth';

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

  const ctxUser = await getUserFromRequest(request);

  const user = await db.userTable.findUnique({
    where: { orgId: orgId, id: userId },
  });

  if (!user) return redirectWithError('..', 'Nepostojeći korisnik');

  const canChangePassword =
    ctxUser?.role === roleValues.ADMIN || ctxUser?.id === userId;

  return json({ ...user, canChangePassword });
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
          <InputField label="Email" name="email" readOnly />
          <InputField label="Ime korisnika" name="name" />
          <SelectField label="Uloga" name="role" data={roleOptions} />
          <SelectField label="Status" name="status" data={statusOptions} />
          <PermissionsForm />

          {user.canChangePassword && (
            <NavLink
              to="change-password"
              className="flex items-center gap-2 self-end border p-2"
            >
              <MdUpdate />
              Promjeni lozinku
            </NavLink>
          )}

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
