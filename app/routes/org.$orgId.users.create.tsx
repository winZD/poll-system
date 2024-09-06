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
} from '~/components/models';
import { ulid } from 'ulid';
import { FormContent } from '~/components/Form/FormContent';

//TODO: create post method
const schema = zod.object({
  name: zod.string().min(1, 'Obvezan podatak'),
  email: zod.string().email('Obvezan podatak'),
  password: zod.string().min(1, 'Obvezan podatak'),
  role: roleSchema.default('ADMIN'),
  status: statusSchema.default('ACTIVE'),
  permissions: zod.string().default(''),
});

type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  // const users = await db.userTable.findMany({ where: { status: "ACTIVE" } });

  return json({});
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

  const orgId = params.orgId;
  if (orgId) {
    await db.userTable.create({
      data: { ...data, id: ulid(), orgId },
    });
    return redirectWithSuccess('..', {
      message: 'Uspješno ste kreirali korisnika',
    });
  }
};

const Index = () => {
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
      >
        <FormContent>
          <InputField label="Email" name="email" autoFocus />
          <InputField label="Ime korisnika" name="name" />
          <InputField label="Inicijalna lozinka" name="password" />
          <SelectField label="Uloga" name="role" data={roleOptions} />
          <SelectField label="Status" name="status" data={statusOptions} />
          <InputField label="Ovlasti" name="permissions" />

          <button
            type="submit"
            className="rounded bg-slate-200 p-2 hover:bg-slate-300"
          >
            Dodaj korisnika
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
};

export default Index;
