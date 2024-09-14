import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import SelectField from '~/components/Form/SelectForm';
import { db } from '~/db';
import { useLoaderData } from '@remix-run/react';
import {
  jsonWithError,
  redirectWithError,
  redirectWithSuccess,
} from 'remix-toast';
import { statusOptions, statusSchema } from '~/components/models';
import { FormContent } from '~/components/Form/FormContent';
import { Button } from '~/components/Button';
import { useFieldArray } from 'react-hook-form';
import FormInput from '~/components/Form/FormInput';
import { ulid } from 'ulid';
import { assert } from '~/utils';
import { HiOutlineTrash } from 'react-icons/hi2';
import { MdAdd, MdContentCopy, MdSave } from 'react-icons/md';
import { toast } from 'react-toastify';
import { ImNewTab } from 'react-icons/im';

const schema = zod.object({
  name: zod.string().min(1),
  status: statusSchema.default('DRAFT'),
  defaultIframeSrc: zod.string().min(3, 'Obvezan podatak'),
  iframeTag: zod.string().min(3, 'Obvezan podatak'),
  iframeSrc: zod.string().min(3, 'Obvezan podatak'),
  qrCodeUrl: zod.string().min(3, 'Obvezan podatak'),
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
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const poll = await db.pollTable.findUnique({
    where: { orgId, id: pollId },
    include: { PollQuestions: true },
  });

  if (!poll) return redirectWithError('..', 'Nepostojeća anketa');

  return json({ data: { poll, baseUrl } });
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  if (errors) {
    console.log({ errors });
    // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
    return jsonWithError({ errors, defaultValues }, 'Nepotpuni podaci');
  }

  const { orgId, pollId } = params;

  assert(orgId && pollId);

  await db.$transaction(async (tx) => {
    await tx.pollTable.update({
      where: { orgId_id: { orgId, id: pollId } },
      data: {
        name: data.name,
        status: data.status,
        iframeSrc: data.iframeSrc,
      },
    });

    await tx.votesTable.deleteMany({ where: { orgId, pollId } });
    await tx.pollQuestionTable.deleteMany({ where: { orgId, pollId } });
    await tx.pollQuestionTable.createMany({ data: data.PollQuestions });
  });

  return redirectWithSuccess('..', 'Uspješno ste ažurirali anketu');
};

const Index = () => {
  const { data } = useLoaderData<typeof loader>();

  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    // resolver,
    defaultValues: {
      ...data.poll,
      status: data?.poll.status as any,
      defaultIframeSrc: `${data.baseUrl}/poll/${data?.poll.id}`,
      iframeTag: `<iframe src="${data.baseUrl}/poll/${data?.poll.id}" style="height:100%;width:100%;" frameborder="0" scrolling="no"/>`,
      qrCodeUrl: `${data.baseUrl}/poll/${data?.poll.id}/tv`,
    },
  });

  // console.log('errors', formMethods.formState.errors);

  const { fields, append, remove } = useFieldArray({
    control: formMethods.control,
    name: 'PollQuestions',
  });

  const values = formMethods.watch();

  function handleCopyToClipboard() {
    //TODO: edit after implementing SSL certificate

    const iframeTag = formMethods.getValues('iframeTag');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(iframeTag)
        .then(() => {
          toast.success('Spremljeno u međuspremnik!', {
            position: 'bottom-center',
          });
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          toast.error('Neuspješno kopiranje u međuspremnik.', {
            position: 'bottom-center',
          });
        });
    } else {
      toast.error('Potrebno podignut SSL. Radi samo sa HTTPS-om', {
        position: 'bottom-center',
      });
    }
  }

  return (
    <Modal title="Ažuriraj anketu">
      <HookForm
        formMethods={formMethods}
        onSubmit={formMethods.handleSubmit}
        method="PUT"
      >
        <FormContent className="">
          <div className="flex gap-8">
            <div className="flex w-96 flex-col gap-2">
              <SelectField label="Status" name="status" data={statusOptions} />
              {/* TODO: add date/time from and date/time to of poll duration */}
              <InputField label="Naziv ankete" name="name" />
              <div className="flex items-end justify-between gap-x-2">
                <div className="flex-1">
                  <InputField
                    readOnly
                    label="URL ankete"
                    name="defaultIframeSrc"
                  />
                </div>
                <button
                  className="flex size-[42px] items-center justify-center gap-2 self-end rounded bg-slate-200 text-xl hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200"
                  type="button"
                  onClick={() =>
                    window.open(values?.defaultIframeSrc, '_blank')
                  }
                >
                  <ImNewTab />
                </button>
              </div>

              <div className="flex items-end justify-between gap-x-2">
                <div className="flex-1">
                  <InputField readOnly label="Iframe tag" name="iframeTag" />
                </div>
                <button
                  className="flex size-[42px] items-center justify-center gap-2 self-end rounded bg-slate-200 text-xl hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200"
                  type="button"
                  onClick={handleCopyToClipboard}
                >
                  <MdContentCopy />
                </button>
              </div>

              <div className="flex items-end justify-between gap-x-2">
                <div className="flex-1">
                  <InputField label="QR code url" name="qrCodeUrl" />
                </div>
                <button
                  className="flex size-[42px] items-center justify-center gap-2 self-end rounded bg-slate-200 text-xl hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200"
                  type="button"
                  onClick={() => window.open(values?.qrCodeUrl, '_blank')}
                >
                  <ImNewTab />
                </button>
              </div>
            </div>
            <div className="border" />
            <div className="flex flex-1 flex-col gap-4 pt-6">
              <Button
                type="button"
                className="flex w-96 items-center justify-center gap-2 font-semibold"
                onClick={() =>
                  append({
                    id: ulid(),
                    name: '',
                    orgId: data?.poll.orgId,
                    pollId: data?.poll.id,
                  })
                }
              >
                <MdAdd /> Dodaj opciju
              </Button>

              <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <FormInput
                        name={`PollQuestions.${index}.name`}
                        key={field.id}
                        label=""
                        placeholder={'Opcija...'}
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
            className="flex items-center gap-2 self-end rounded bg-blue-200 p-2 px-8 hover:bg-blue-300 disabled:cursor-not-allowed disabled:bg-slate-200"
            // disabled={poll.status !== statusValues.DRAFT}
          >
            <MdSave />
            Ažuriraj anketu
          </button>
        </FormContent>
      </HookForm>
    </Modal>
  );
};

export default Index;
