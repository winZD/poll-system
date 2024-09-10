import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData, useSubmit } from '@remix-run/react';
import * as zod from 'zod';
import { db } from '~/db';
import { toHrDateString } from '~/utils';
import crypto from 'crypto'; // If using ES Modules
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { ulid } from 'ulid';
import { getClientIPAddress } from '~/functions/get-client-ip-address';

const schema = zod.object({
  name: zod.string().min(1),
  email: zod.string().email('Neispravan email').min(1),
  password: zod.string().min(1),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { id } = params;

  const poll = await db.pollTable.findUniqueOrThrow({
    where: { id },
    include: {
      PollQuestions: true,
      Org: true,
    },
  });

  const userAgent = request.headers.get('user-agent'); // Get user agent
  const forwardedFor = request.headers.get('x-forwarded-for'); // Get forwarded IP
  const ipAddress = getClientIPAddress(request);

  //   console.log({ userAgent, forwardedFor, ipAddress });

  const dataToHash = `${userAgent}-${forwardedFor}-${ipAddress}`;

  const fingerPrint = crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex'); // Output as a hex string

  const existingVote = await db.votesTable.findFirst({
    where: { orgId: poll.orgId, pollId: poll.id, fingerPrint },
  });

  const votes = await db.votesTable.groupBy({
    by: ['pollQuestionId'],
    where: { orgId: poll.orgId, pollId: poll.id },
    _count: true,
  });

  return json({ poll, existingVote: existingVote?.pollQuestionId, votes });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const orgId = formData.get('orgId')?.toString();
  const pollId = formData.get('pollId')?.toString();
  const pollQuestionId = formData.get('pollQuestionId')?.toString();

  if (!orgId || !pollId || !pollQuestionId)
    return jsonWithError(null, 'Greška');

  const userAgent = request.headers.get('user-agent'); // Get user agent
  const forwardedFor = request.headers.get('x-forwarded-for'); // Get forwarded IP
  const ipAddress = getClientIPAddress(request);

  const dataToHash = `${userAgent}-${forwardedFor}-${ipAddress}`;

  const fingerPrint = crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex'); // Output as a hex string

  if (request.method === 'POST') {
    await db.votesTable.create({
      data: { fingerPrint, id: ulid(), orgId, pollId, pollQuestionId },
    });
  } else if (request.method === 'DELETE') {
    await db.votesTable.deleteMany({ where: { orgId, pollId, fingerPrint } });
  }

  return jsonWithSuccess(true, 'Vaš glas je uspješno zabilježen');
};

export default function Index() {
  const { poll, existingVote, votes } = useLoaderData<typeof loader>();

  const ukupnoGlasova = votes.reduce((acc, current) => acc + current._count, 0);
  const maxBrojGlasova = Math.max(...votes.map((e) => e._count));

  const submit = useSubmit();

  return (
    <>
      <div className="m-auto flex flex-col rounded border shadow-lg">
        <div className="border-b p-4 text-center">{poll.Org.name}</div>
        <div className="flex flex-col gap-6 px-8 py-4">
          <div className="text-center font-semibold">{poll.name}</div>

          {existingVote && (
            <div className="flex flex-col text-center">
              <div>Već ste dali svoj glas</div>
              <button
                onClick={() =>
                  submit(
                    {
                      pollQuestionId: 'null',
                      orgId: poll.orgId,
                      pollId: poll.id,
                    },
                    { method: 'DELETE' },
                  )
                }
                className={`rounded bg-red-100 px-4 py-2 hover:bg-blue-100`}
              >
                {'ukloni glas (DEV ONLY)'}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {poll.PollQuestions.map((e) => (
              <>
                <button
                  key={e.id}
                  onClick={() => {
                    if (existingVote) return;
                    submit(
                      {
                        pollQuestionId: e.id,
                        orgId: e.orgId,
                        pollId: e.pollId,
                      },
                      { method: 'POST' },
                    );
                  }}
                  className={`rounded px-4 py-2 ${existingVote ? 'cursor-default' : 'hover:bg-blue-100'} ${existingVote === e.id ? 'bg-green-100' : 'bg-blue-50'}`}
                >
                  {e.name}
                </button>
              </>
            ))}
          </div>

          {existingVote && (
            <div className="text-center font-semibold">{`Ukupan broj glasova ${ukupnoGlasova}`}</div>
          )}

          <div className="flex gap-8">
            <div className="">Vrijeme završetka ankete</div>
            <div className="font-semibold">
              {toHrDateString(poll.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
