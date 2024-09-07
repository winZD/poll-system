import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData, useSubmit } from '@remix-run/react';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { db } from '~/db';
import { statusMapped } from '~/components/models';
import { toHrDateString } from '~/utils';
import crypto from 'crypto'; // If using ES Modules
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { ulid } from 'ulid';

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

  const voteExists = await db.votesTable.findFirst({
    where: { orgId: poll.orgId, pollId: poll.id, fingerPrint },
  });

  return json({ ...poll, isVoted: !!voteExists });
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
  const poll = useLoaderData<typeof loader>();

  const isVoted = poll.isVoted;

  const submit = useSubmit();
  //   const maxVotes = Math.max(...poll.PollQuestions.map((e) => e.Votes.length));

  return (
    <>
      {isVoted ? (
        <div>
          <div>Već ste glasali, dodati layout</div>
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
            className={`rounded bg-blue-50 px-4 py-2 hover:bg-blue-100`}
          >
            {'ukloni glasove'}
          </button>
        </div>
      ) : (
        <div className="m-auto flex flex-col rounded border shadow-lg">
          <div className="border-b p-4 text-center">{poll.Org.name}</div>
          <div className="flex flex-col gap-6 px-8 py-4">
            <div className="text-center font-semibold">{poll.name}</div>

            <div className="flex flex-col gap-2">
              {poll.PollQuestions.map((e) => (
                <>
                  <button
                    key={e.id}
                    onClick={() =>
                      submit(
                        {
                          pollQuestionId: e.id,
                          orgId: e.orgId,
                          pollId: e.pollId,
                        },
                        { method: 'POST' },
                      )
                    }
                    className={`rounded bg-blue-50 px-4 py-2 hover:bg-blue-100`}
                  >
                    {e.name}
                  </button>
                </>
              ))}
            </div>

            <div className="flex gap-8">
              <div className="">Vrijeme završetka ankete</div>
              <div className="font-semibold">
                {toHrDateString(poll.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function getClientIPAddress(request: Request): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0];
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return undefined;
}
