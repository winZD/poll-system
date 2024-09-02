import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, json, useLoaderData } from '@remix-run/react';
import React from 'react';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = zod.object({
  name: zod.string().min(1),
  email: zod.string().email().min(1),
  password: zod.string().min(1),
});

type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  // check if admin is logged in

  // const users = await db.userTable.findMany({ where: { status: "ACTIVE" } });

  return json({});
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);
  if (errors) {
    // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
    return json({ errors, defaultValues });
  }

  // Do something with the data
  return json(data);
};
export default function Index() {
  React.useEffect(() => {}, []);

  const data = useLoaderData<typeof loader>();

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useRemixForm<FormData>({
    mode: 'onSubmit',
    resolver,
  });

  return (
    <Modal title="Novi korisnik/organizacija">
      <Form
        onSubmit={handleSubmit}
        method="POST"
        className="flex w-96 flex-col gap-4 p-4"
      >
        <label className="flex justify-between gap-2">
          Naziv:
          <input
            autoComplete="off"
            className="rounded outline-none"
            type="text"
            {...register('name')}
          />
          {errors.name && <p>{errors.name.message}</p>}
        </label>
        <label className="flex justify-between gap-2">
          Email:
          <input
            autoComplete="off"
            type="text"
            className="rounded outline-none"
            {...register('email')}
          />
          {errors.email && <p>{errors.email.message}</p>}
        </label>
        <label className="flex justify-between gap-2">
          Lozinka:
          <input
            autoComplete="off"
            className="rounded outline-none"
            type="text"
            {...register('email')}
          />
          {errors.password && <p>{errors.password.message}</p>}
        </label>
        <button type="submit">Submit</button>
      </Form>
    </Modal>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
