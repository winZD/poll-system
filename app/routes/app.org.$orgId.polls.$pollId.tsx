import { LoaderFunctionArgs, json, ActionFunctionArgs } from '@remix-run/node';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import SelectField from '~/components/Form/SelectForm';
import { db } from '~/db';
import { useLoaderData, useParams, useSearchParams } from '@remix-run/react';
import {
  jsonWithError,
  redirectWithError,
  redirectWithSuccess,
} from 'remix-toast';
import { statusSchema, statusValues } from '~/components/models';
import { FormContent } from '~/components/Form/FormContent';
import { Button } from '~/components/Button';
import { useFieldArray } from 'react-hook-form';
import FormInput from '~/components/Form/FormInput';
import { ulid } from 'ulid';
import { assert, getStatusOptions } from '~/utils';
import { HiOutlineTrash } from 'react-icons/hi2';
import { MdAdd, MdContentCopy, MdSave } from 'react-icons/md';
import { toast } from 'react-toastify';
import { ImNewTab } from 'react-icons/im';
import { useAppLoader } from '~/loaders';

import { FormDate } from '~/components/Form/FormDate';
import { useTranslation } from 'react-i18next';
import { PollChartWithVotes } from '~/components/PollChartWithVotes';
import { getPollDetails } from '~/functions/getPollDetails';
import i18next from '~/i18n.server';
import { parse } from 'cookie';

const schema = zod.object({
  name: zod.string().min(1),
  status: statusSchema.default('DRAFT'),
  defaultIframeSrc: zod.string().min(3, 'Obvezan podatak'),
  iframeTag: zod.string().min(3, 'Obvezan podatak'),
  iframeSrc: zod.string().min(3, 'Obvezan podatak'),
  qrCodeProviderUrl: zod.string().min(3, 'Obvezan podatak'),
  PollQuestions: zod.array(
    zod.object({
      id: zod.string(),
      pollId: zod.string(),
      name: zod.string().min(1, 'Obvezan podatak'),
    }),
  ),
  expiresAt: zod.coerce.date().nullish(),
  orgPollByIdApi: zod.string(),
  orgPollsApi: zod.string(),
  poolFooter: zod.string(),
});

type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

const sidebars = [
  'poll',
  'cities',
  'regions',
  'countries',
  // 'postal',
  // 'timezone',
] as const;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, pollId } = params;
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const { poll } = await getPollDetails({
    pollId: pollId as string,
    orgId: orgId as string,
  });

  if (!poll) return redirectWithError('..', 'Nepostojeća anketa');

  return json({ poll, baseUrl });
}
export type PollLoaderType = typeof loader;

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  let localeFromReq = await i18next.getLocale(request);

  const cookieHeader = request.headers.get('Cookie') || '';

  const cookies = parse(cookieHeader);

  const locale = cookies['lng'] ? cookies['lng'] : localeFromReq;

  const t = await i18next.getFixedT(locale);

  if (errors) {
    console.log({ errors });
    // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
    return jsonWithError({ errors, defaultValues }, t('incompleteData'));
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

    await tx.votesTable.deleteMany({
      where: {
        orgId,
        pollQuestionId: { notIn: data.PollQuestions.map((e) => e.id) },
      },
    });
    await tx.pollQuestionTable.deleteMany({
      where: { orgId, id: { notIn: data.PollQuestions.map((e) => e.id) } },
    });

    await Promise.all(
      data.PollQuestions.map(async (e) =>
        tx.pollQuestionTable.upsert({
          where: { id: e.id },
          create: { ...e, orgId },
          update: { name: e.name },
        }),
      ),
    );
  });

  return redirectWithSuccess('..', t('successPollUpdate'));
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTab = searchParams.get('tab') || 'details'; // details | statistics

  const { t } = useTranslation();

  return (
    <Modal title={t('updatePoll')}>
      <div className="flex h-[960px] w-[1000px] flex-1 flex-col self-stretch overflow-hidden p-4">
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

  const { orgId, pollId } = useParams();

  const { User } = useAppLoader();

  // console.log('errors', formMethods.formState.errors);

  function handleCopyToClipboard() {
    //TODO: edit after implementing SSL certificate

    const iframeTag = formMethods.getValues('iframeTag');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(iframeTag)
        .then(() => {
          toast.success(t('clipboard'), {
            position: 'bottom-center',
          });
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          toast.error(t('errorClipboard'), {
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
      defaultIframeSrc: `${data.baseUrl}/poll/${orgId}/${data?.poll.id}`,
      iframeTag: `<iframe src="${data.baseUrl}/poll/${orgId}/${data?.poll.id}" style="height:100%;width:100%;" frameborder="0" scrolling="no"/>`,
      qrCodeProviderUrl: ``,
      expiresAt: data.poll.expiresAt ? new Date(data.poll.expiresAt) : null,
      orgPollByIdApi: `${data.baseUrl}/api/${orgId}/${data.poll.id}/${User.id}`,
      orgPollsApi: `${data.baseUrl}/api/${orgId}/polls/${User.id}`,
      poolFooter: `${data.baseUrl}/app/org/${orgId}/polls/${data.poll.id}/footer`,
    },
  });

  const values = formMethods.watch();

  const { fields, append, remove } = useFieldArray({
    control: formMethods.control,
    name: 'PollQuestions',
  });

  const editable = data.poll.status === statusValues.DRAFT && User.canUpdate;

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
              // disabled={!editable}
              label={t('pollStatus')}
              name="status"
              data={getStatusOptions()}
            />
            {/* TODO: add date/time from and date/time to of poll duration */}
            <InputField
              readOnly={!editable}
              label={t('pollName')}
              name="name"
            />

            <FormDate
              readOnly={!editable}
              label={t('pollExpirationTime')}
              name="expiresAt"
            />

            <div className="flex items-end justify-between gap-x-2">
              <div className="flex-1">
                <InputField
                  readOnly
                  label={t('pollPreview')}
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
                  readOnly={!editable}
                  label={t('qrCodeProviderUrl')}
                  name="qrCodeProviderUrl"
                />
              </div>
              <button
                className="flex size-[42px] items-center justify-center gap-2 self-end rounded bg-slate-200 text-xl hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200"
                type="button"
                onClick={() => window.open(values?.qrCodeProviderUrl, '_blank')}
              >
                <ImNewTab />
              </button>
            </div>
            {User.canReadApi && (
              <>
                <div className="flex items-end justify-between gap-x-2">
                  <div className="flex-1">
                    <InputField
                      readOnly
                      label={t('orgPollByIdApi')}
                      name="orgPollByIdApi"
                    />
                  </div>
                  <button
                    className="flex size-[42px] items-center justify-center gap-2 self-end rounded bg-slate-200 text-xl hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200"
                    type="button"
                    onClick={() =>
                      window.open(values?.orgPollByIdApi, '_blank')
                    }
                  >
                    <ImNewTab />
                  </button>
                </div>
                <div className="flex items-end justify-between gap-x-2">
                  <div className="flex-1">
                    <InputField
                      readOnly
                      label={t('orgPollsApi')}
                      name="orgPollsApi"
                    />
                  </div>
                  <button
                    className="flex size-[42px] items-center justify-center gap-2 self-end rounded bg-slate-200 text-xl hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200"
                    type="button"
                    onClick={() => window.open(values?.orgPollsApi, '_blank')}
                  >
                    <ImNewTab />
                  </button>
                </div>
              </>
            )}
            <div className="flex items-end justify-between gap-x-2">
              <div className="flex-1">
                <InputField readOnly label={t('footer')} name="poolFooter" />
              </div>
              <button
                className="flex size-[42px] items-center justify-center gap-2 self-end rounded bg-slate-200 text-xl hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200"
                type="button"
                onClick={() => window.open(values?.poolFooter, '_blank')}
              >
                <ImNewTab />
              </button>
            </div>
          </div>
          <div className="border" />
          <div className="flex min-w-96 flex-1 flex-col gap-4 pt-6">
            {editable && (
              <Button
                type="button"
                className="flex w-96 items-center justify-center gap-2 font-semibold"
                onClick={() =>
                  append({
                    id: ulid(),
                    name: '',
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
                      readOnly={!editable}
                    />
                  </div>
                  {editable && (
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
        {selectedSidebar === 'poll' ? (
          <PollChartWithVotes />
        ) : (
          <SidebarStatisticElement />
        )}
      </div>
    </div>
  );
};

const SidebarStatisticElement = () => {
  const { poll } = useLoaderData<typeof loader>();

  const options = ['countries', 'regions', 'cities'] as const;

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSidebar = searchParams.get('statistics-sidebar') || '';

  const option = options.includes(selectedSidebar as any)
    ? selectedSidebar
    : null;

  if (!option) return null;

  const distinctValues = [
    ...new Set(
      poll.PollQuestions.flatMap((e) => e.votes[option])
        .map((e) => e.name)
        .filter(Boolean),
    ),
  ];

  return (
    <div className="flex flex-col gap-2 overflow-auto px-4">
      {distinctValues.map((e, index) => (
        <div key={index}>{e}</div>
      ))}
    </div>
  );
};
