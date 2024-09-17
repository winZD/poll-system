import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import { ulid } from 'ulid';
import { db } from '~/db';
import { jsonWithError, redirectWithSuccess } from 'remix-toast';
import { statusSchema, statusValues } from '~/components/models';
import { addDays } from 'date-fns';
import { FormContent } from '~/components/Form/FormContent';
import { getUserFromRequest } from '~/auth';

//TODO: create post method
const schema = zod.object({
  name: zod.string().min(1),
  status: statusSchema.default('DRAFT'),
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

  const ctxUser = await getUserFromRequest(request);

  const orgId = params.orgId;
  if (orgId && ctxUser?.id) {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const id = ulid();
    await db.pollTable.create({
      data: {
        id,
        orgId,
        userId: ctxUser.id,
        name: data.name,
        status: data.status,
        createdAt: new Date(),
        expiresAt: addDays(new Date().setHours(0, 0, 0, 0), 7),
        iframeTitle: '',
        iframeSrc: baseUrl,
      },
    });
    return redirectWithSuccess(`../${id}`, {
      message: 'Uspješno ste kreirali anketu',
    });
  }
};

export default function Index() {
  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    // resolver,
    defaultValues: { name: '', status: statusValues.DRAFT },
  });

  return (
    <Modal title="Nova anketa">
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="POST"
      >
        <FormContent>
          {/* <SelectField label="Status" name="status" data={statusOptions} /> */}
          <InputField label="Naziv ankete" name="name" />

          <button
            type="submit"
            className="rounded bg-slate-200 p-2 hover:bg-slate-300"
          >
            Dodaj anketu
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
}
