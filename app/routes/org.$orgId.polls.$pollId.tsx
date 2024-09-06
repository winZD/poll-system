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
import { ulid } from 'ulid';
import { db, decodeTokenFromRequest } from '~/db';
import { useLoaderData } from '@remix-run/react';
import {
  jsonWithError,
  jsonWithSuccess,
  redirectWithError,
  redirectWithSuccess,
  redirectWithToast,
} from 'remix-toast';
import { statusOptions, statusSchema } from '~/components/models';
import { FormContent } from '~/components/Form/FormContent';

const schema = zod.object({
  name: zod.string().min(1),
  status: statusSchema.default('DRAFT'),
  defaultIframeSrc: zod.string().min(3, 'Obvezan podatak'),
  iframeSrc: zod.string().min(3, 'Obvezan podatak'),
});

type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  // const users = await db.userTable.findMany({ where: { status: "ACTIVE" } });
  const { orgId, pollId } = params;

  const poll = await db.pollTable.findUnique({
    where: { orgId: orgId, id: pollId },
  });

  if (!poll) return redirectWithError('..', 'Nepostojeća anketa');

  return json(poll);
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

  const { orgId, pollId } = params;
  await db.pollTable.update({
    where: { orgId, id: pollId },
    data: {
      name: data.name,
      status: data.status,
      iframeSrc: data.iframeSrc,
    },
  });

  return redirectWithSuccess('..', 'Uspješno ste ažurirali anketu');
};

const Index = () => {
  const poll = useLoaderData<typeof loader>();
  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      ...poll,
      status: poll?.status as any,
      defaultIframeSrc: `http://localhost:5173/poll/${poll.id}`,
    },
  });

  return (
    <Modal title="Ažuriraj anketu">
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="PUT"
      >
        <FormContent>
          <SelectField label="Status" name="status" data={statusOptions} />
          <InputField label="Naziv ankete" name="name" />

          <InputField
            readOnly
            label="Izvorni IframeSrc"
            name="defaultIframeSrc"
          />
          <InputField label="IframeSrc" name="iframeSrc" />

          <button
            type="submit"
            className="rounded bg-slate-200 p-2 hover:bg-slate-300"
          >
            Ažuriraj anketu
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
};

export default Index;
