import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import SelectField from '~/components/Form/SelectForm';
import { db } from '~/db';
import { useLoaderData, useSearchParams } from '@remix-run/react';
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
import { useAppLoader } from '~/loaders';

import { FormDate } from '~/components/Form/FormDate';
import { useTranslation } from 'react-i18next';

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
  expiresAt: zod.coerce.date().nullish(),
});

type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

const sidebars = [
  'poll',
  'city',
  'region',
  'country',
  'postal',
  'timezone',
] as const;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, pollId } = params;
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const poll = await db.pollTable.findUnique({
    where: { orgId, id: pollId },
    include: { PollQuestions: true, Votes: true },
  });

  const votes = await db.votesTable.groupBy({
    by: ['pollQuestionId'],
    where: { pollId },
    _count: true,
  });

  if (!poll) return redirectWithError('..', 'Nepostojeća anketa');

  return json({ poll, baseUrl, votes });
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
        expiresAt: data.expiresAt || undefined,
      },
    });

    await tx.votesTable.deleteMany({ where: { orgId, pollId } });
    await tx.pollQuestionTable.deleteMany({ where: { orgId, pollId } });
    await tx.pollQuestionTable.createMany({ data: data.PollQuestions });
  });

  return redirectWithSuccess('..', 'Uspješno ste ažurirali anketu');
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTab = searchParams.get('tab') || 'details'; // details | statistics

  const { t } = useTranslation();

  return (
    <Modal title={t('updatePoll')}>
      <div className="flex h-[660px] w-[1000px] flex-1 flex-col self-stretch overflow-hidden p-4">
        <div className="flex self-start font-semibold text-slate-900">
          <div
            onClick={() => {
              const params = new URLSearchParams();
              params.set('tab', 'details');
              setSearchParams(params);
            }}
            className={`cursor-pointer rounded-t px-4 py-1 ${
              selectedTab === 'details' ? 'bg-blue-200' : ''
            }`}
          >
            {t('details')}
          </div>
          <div
            onClick={() => {
              const params = new URLSearchParams();
              params.set('tab', 'statistics');
              setSearchParams(params);
            }}
            className={`cursor-pointer rounded-t px-4 py-1 ${
              selectedTab === 'statistics' ? 'bg-blue-200' : ''
            }`}
          >
            {t('statistics')}
          </div>
        </div>
        <div className="border-primary-200 flex flex-1 flex-col overflow-hidden border">
          {selectedTab === 'details' ? <DetailsTab /> : <StatisticsTab />}
        </div>
      </div>
    </Modal>
  );
};

export default Index;

const DetailsTab = (props) => {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const { User } = useAppLoader();

  // console.log('errors', formMethods.formState.errors);

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

  const formMethods = useRemixForm<FormData>({
    mode: 'onSubmit',
    // resolver,
    defaultValues: {
      ...data.poll,
      status: data?.poll.status as any,
      defaultIframeSrc: `${data.baseUrl}/poll/${data?.poll.id}`,
      iframeTag: `<iframe src="${data.baseUrl}/poll/${data?.poll.id}" style="height:100%;width:100%;" frameborder="0" scrolling="no"/>`,
      qrCodeUrl: `${data.baseUrl}/poll/${data?.poll.id}/tv`,
      expiresAt: data.poll.expiresAt ? new Date(data.poll.expiresAt) : null,
    },
  });

  const values = formMethods.watch();

  const { fields, append, remove } = useFieldArray({
    control: formMethods.control,
    name: 'PollQuestions',
  });

  return (
    <HookForm
      formMethods={formMethods}
      onSubmit={formMethods.handleSubmit}
      method="PUT"
    >
      <FormContent className="">
        <div className="flex gap-8 pb-16">
          <div className="flex w-96 flex-col gap-2">
            <SelectField
              disabled={!User.canUpdate}
              label={t('pollStatus')}
              name="status"
              data={statusOptions}
            />
            {/* TODO: add date/time from and date/time to of poll duration */}
            <InputField
              readOnly={!User.canUpdate}
              label={t('pollName')}
              name="name"
            />

            <FormDate
              readOnly={!User.canUpdate}
              label={t('pollExpirationTime')}
              name="expiresAt"
            />

            <div className="flex items-end justify-between gap-x-2">
              <div className="flex-1">
                <InputField
                  readOnly
                  label={t('pollURL')}
                  name="defaultIframeSrc"
                />
              </div>
              <button
                className="flex size-[42px] items-center justify-center gap-2 self-end rounded bg-slate-200 text-xl hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200"
                type="button"
                onClick={() => window.open(values?.defaultIframeSrc, '_blank')}
              >
                <ImNewTab />
              </button>
            </div>

            <div className="flex items-end justify-between gap-x-2">
              <div className="flex-1">
                <InputField readOnly label={t('iframeTag')} name="iframeTag" />
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
                <InputField
                  readOnly={!User.canUpdate}
                  label={t('QRCodeUR')}
                  name="qrCodeUrl"
                />
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
          <div className="flex min-w-96 flex-1 flex-col gap-4 pt-6">
            {User.canUpdate && (
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
                <MdAdd /> {t('addOption')}
              </Button>
            )}

            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <FormInput
                      name={`PollQuestions.${index}.name`}
                      key={field.id}
                      label=""
                      placeholder={t('option')}
                      readOnly={!User.canUpdate}
                    />
                  </div>
                  {User.canUpdate && (
                    <button
                      className=""
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <HiOutlineTrash className="text-lg text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {User.canUpdate && (
          <button
            type="submit"
            className="flex items-center gap-2 self-end rounded bg-slate-200 p-2 px-8 hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200"
            // disabled={poll.status !== statusValues.DRAFT}
          >
            <MdSave />
            {t('updatePoll')}
          </button>
        )}
      </FormContent>
    </HookForm>
  );
};

const PollChart = (props) => {
  const data = useLoaderData<typeof loader>();

  const maxVotes = Math.max(...data.votes.map((e) => e._count));

  const totalVotes = data.poll.Votes.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="font-semibold"> {data.poll.name}</div>

      <div className="flex flex-col gap-2">
        {data.poll.PollQuestions.map((e) => {
          const questionVotes =
            data.votes.find((v) => v.pollQuestionId === e.id)?._count || 0;

          const percent = (questionVotes / totalVotes) * 100;

          return (
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex flex-1 justify-between gap-16 overflow-hidden rounded-lg bg-slate-100 px-2 py-1">
                <div
                  className={`absolute bottom-0 left-0 top-0 ${maxVotes === questionVotes ? 'bg-green-400' : 'bg-green-200'}`}
                  style={{ width: `${percent}%` }}
                />
                <div
                  key={e.id}
                  className={`z-10 ${maxVotes === questionVotes ? 'font-semibold' : ''}`}
                >
                  {e.name}
                </div>
                <div className="z-10">{questionVotes}</div>
              </div>
              <div className="w-20 text-right">
                {percent.toLocaleString('hr-HR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                %
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-4 px-2">
        <div className="flex-1 text-right">{`Ukupno glasova `}</div>
        <div>{`${totalVotes}`}</div>
        <div className="w-20 text-right"></div>
      </div>
    </div>
  );
};

const StatisticsTab = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSidebar = searchParams.get('statistics-sidebar') || 'poll'; // details | statistics

  const { t } = useTranslation();

  return (
    <div className="flex flex-1 gap-2 overflow-auto p-4">
      <div className="flex flex-col font-semibold text-slate-900">
        {sidebars.map((sidebar) => (
          <div
            key={sidebar}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('statistics-sidebar', sidebar);
              setSearchParams(params);
            }}
            className={`cursor-pointer rounded-t px-4 py-1 ${
              selectedSidebar === sidebar ? 'bg-blue-200' : ''
            }`}
          >
            {t(`poll-statistics-sidebar.${sidebar}`)}
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden px-16">
        {selectedSidebar === 'poll' && <PollChart />}
        <SidebarStatisticElement />
      </div>
    </div>
  );
};

const SidebarStatisticElement = () => {
  const { poll } = useLoaderData<typeof loader>();

  const options = ['city', 'region', 'country', 'postal', 'timezone'] as const;

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSidebar = searchParams.get('statistics-sidebar') || ''; // details | statistics

  const option = options.includes(selectedSidebar as any)
    ? selectedSidebar
    : null;

  if (!option) return null;

  const values = poll.Votes.map((e) => e[option]).filter((e) => !!e);

  const occurrences = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  const sortedOccurrences = Object.entries(occurrences).sort(
    (a: any, b: any) => b[1] - a[1],
  );

  return (
    <div className="flex flex-col gap-2 overflow-auto px-4">
      {sortedOccurrences.map((e: any) => {
        const valueVotes = e[1];

        const percent = (valueVotes / values.length) * 100;

        return (
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex flex-1 justify-between gap-16 overflow-hidden rounded-lg bg-slate-100 px-2 py-1">
              <div
                className="absolute bottom-0 left-0 top-0 bg-green-500 opacity-20"
                style={{ width: `${percent}%` }}
              />
              <div key={e.id} className={``}>
                {e[0]}
              </div>
              <div>{valueVotes}</div>
            </div>
            <div className="w-20 text-right">
              {percent.toLocaleString('hr-HR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              %
            </div>
          </div>
        );
      })}
    </div>
  );
};
