import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import SelectField from '~/components/Form/SelectForm';
import { db } from '~/db';
import { useLoaderData, useNavigate, useParams } from '@remix-run/react';
import {
  jsonWithError,
  redirectWithError,
  redirectWithSuccess,
} from 'remix-toast';
import { statusOptions, statusSchema } from '~/components/models';
import { FormContent } from '~/components/Form/FormContent';
import { Button } from '~/components/Button';
import { useFieldArray } from 'react-hook-form';
import { FormValidationContext } from 'react-stately';
import FormInput from '~/components/Form/FormInput';
import { ulid } from 'ulid';
import { assert } from '~/utils';
import { HiOutlineTrash } from 'react-icons/hi2';

const schema = zod.object({
  name: zod.string().min(1),
  status: statusSchema.default('DRAFT'),
  defaultIframeSrc: zod.string().min(3, 'Obvezan podatak'),
  iframeSrc: zod.string().min(3, 'Obvezan podatak'),
  PollQuestions: zod.array(
    zod.object({
      id: zod.string(),
      orgId: zod.string(),
      pollId: zod.string(),
      name: zod.string().min(1, 'Obvezan podatak'),
    }),
  ),
});

type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, pollId } = params;

  const poll = await db.pollTable.findUnique({
    where: { orgId: orgId, id: pollId },
    include: { PollQuestions: true },
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

    // console.log({ errors });

    return jsonWithError({ errors, defaultValues }, 'Neispravni podaci');
  }

  const { orgId, pollId } = params;

  await db.$transaction(async (tx) => {
    await tx.pollTable.update({
      where: { orgId, id: pollId },
      data: {
        name: data.name,
        status: data.status,
        iframeSrc: data.iframeSrc,
      },
    });

    await tx.pollQuestionTable.deleteMany({ where: { orgId, pollId } });

    await tx.pollQuestionTable.createMany({ data: data.PollQuestions });
  });

  return redirectWithSuccess('..', 'Uspješno ste ažurirali anketu');
};

const Index = () => {
  const poll = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const params = useParams();

  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    // resolver,
    defaultValues: {
      ...poll,
      status: poll?.status as any,
      defaultIframeSrc: `http://localhost:5173/poll/${poll.id}`,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: formMethods.control,
    name: 'PollQuestions',
  });

  return (
    <Modal title="Ažuriraj anketu">
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="PUT"
      >
        <FormContent className="">
          <div className="flex gap-8">
            <div className="flex w-96 flex-col">
              <SelectField label="Status" name="status" data={statusOptions} />
              <InputField label="Naziv ankete" name="name" />

              <InputField
                readOnly
                label="Izvorni IframeSrc"
                name="defaultIframeSrc"
              />
              <InputField label="IframeSrc" name="iframeSrc" />
            </div>
            <div className="border" />
            <div className="flex flex-1 flex-col gap-4 pt-6">
              <Button
                type="button"
                className="w-96"
                onClick={() =>
                  append({
                    id: ulid(),
                    name: '',
                    orgId: poll.orgId,
                    pollId: poll.id,
                  })
                }
              >
                + Dodaj opciju
              </Button>

              <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <FormInput
                        name={`PollQuestions.${index}.name`}
                        key={field.id}
                        label=""
                        placeholder="Opcija..."
                      />
                    </div>
                    <button
                      className=""
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <HiOutlineTrash className="text-lg text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="rounded bg-blue-200 p-2 hover:bg-slate-300"
          >
            Ažuriraj anketu
          </button>
          <button
            type="button"
            onClick={() => navigate(`/poll/${params.pollId}`)}
            className="rounded bg-slate-200 p-2 hover:bg-slate-300"
          >
            Anketa
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
};

export default Index;
