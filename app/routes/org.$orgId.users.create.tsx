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
import React from 'react';
import { db } from '~/utils/db';
import { ulid } from 'ulid';
import { decodeTokenFromRequest } from '~/utils';
import { redirectWithToast } from 'remix-toast';
enum StatusType {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
}

const roleSchema = zod.enum(['ADMIN', 'USER']);
const roleValues = roleSchema.Values;
const roleOptions = [
  { value: roleValues.ADMIN, label: 'Admin' },
  { value: roleValues.USER, label: 'Korisnik' },
];

//TODO: create post method
const schema = zod.object({
  name: zod.string().min(1),
  password: zod.string().min(1),
  role: zod.string().min(1),
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

  const ctx = await decodeTokenFromRequest(request);

  return redirectWithToast('..', {
    message: 'Uspješno ste kreirali anketu',
    description: 'Kreiranje ankete',
    type: 'success',
  });
};

const Index = () => {
  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    resolver,
  });

  const { formState, watch } = formMethods;
  React.useEffect(() => {
    console.log('Current form values:', watch());
  }, [watch, formState]);

  return (
    <Modal title="Nova anketa">
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="POST"
        className="flex w-96 flex-col gap-4 p-4"
      >
        <SelectField
          label="Status"
          name="status"
          data={Object.values(StatusType).map((value, index) => ({
            id: index,
            value,
          }))}
        />
        <InputField label="Name" name="name" />
        <InputField label="Title" name="iframeTitle" />
        <InputField label="Src" name="iframeSrc" />

        <button
          type="submit"
          className="rounded bg-slate-200 p-2 hover:bg-slate-300"
        >
          Dodaj anketu
        </button>
      </HookForm>
    </Modal>
  );
};

export default Index;
