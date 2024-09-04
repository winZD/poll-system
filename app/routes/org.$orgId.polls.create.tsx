import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import SelectField from '~/components/Form/SelectForm';
import React from 'react';
enum StatusType {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
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

export const action = async ({ request }: ActionFunctionArgs) => {};

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