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
enum StatusType {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
}
//TODO: create post method
const schema = zod.object({
  name: zod.string().min(1),
  status: zod.nativeEnum(StatusType),
  iframeTitle: zod.string().min(1),
  iframeSrc: zod.string().min(1),
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

  await db.$transaction(async (tx) => {
    await tx.pollTable.create({
      data: {
        id: ulid(),
        orgId: params?.orgId || '',
        userId: ctx?.userId || '',
        name: data!.name,
        createdAt: new Date(),
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: data?.status,
        iframeTitle: data?.iframeTitle || '',
        iframeSrc: `http://localhost:5173/poll/${data?.iframeSrc}`,
      },
    });
  });
  return redirect(`..`);
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
