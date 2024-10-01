import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData, useSubmit } from '@remix-run/react';
import * as zod from 'zod';
import { db } from '~/db';
import { toHrDateString } from '~/utils';
import crypto from 'crypto'; // If using ES Modules
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { ulid } from 'ulid';
import { getClientIPAddress } from '~/functions/get-client-ip-address';
import { getPollData } from '~/functions/getPollData';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, pollId } = params;

  const { poll, votes } = await getPollData({
    pollId: pollId as string,
    orgId: orgId as string,
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
    where: { pollId, fingerPrint },
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
    const id = ulid();
    await db.votesTable.create({
      data: {
        fingerPrint,
        id,
        orgId,
        pollId,
        pollQuestionId,
        ipAddress,
      },
    });

    if (ipAddress) {
      fetch(`https://ipinfo.io/${ipAddress}/json`)
        .then(async (res) => {
          const data = await res.json();
          try {
            await db.votesTable.update({
              where: { id },
              data: {
                hostname: data.hostname,
                city: data.city,
                region: data.region,
                country: data.country,
                loc: data.loc,
                org: data.org,
                postal: data.postal,
                timezone: data.timezone,
                userAgent: userAgent,
              },
            });
          } catch (e) {
            console.log('error updating ip details', { e });
          }
        })
        .catch((e) => console.log('error fetching  ip details'));
    }
  } else if (request.method === 'DELETE') {
    await db.votesTable.deleteMany({ where: { orgId, pollId, fingerPrint } });
  }

  return jsonWithSuccess({}, 'Vaš glas je uspješno zabilježen');
};

export default function Index() {
  const { poll, existingVote, votes } = useLoaderData<typeof loader>();

  const ukupnoGlasova = votes.reduce((acc, current) => acc + current._count, 0);
  const maxBrojGlasova = Math.max(...votes.map((e) => e._count));

  const submit = useSubmit();

  return (
    <>
      <div className="m-auto flex flex-col rounded border shadow-lg">
        {/* <div className="border-b p-4 text-center">{poll.Org.name}</div> */}
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
                      // orgId: poll.orgId,
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
                        // orgId: e.orgId,
                        pollId: poll.id,
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
