import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { Modal } from '~/components/Modal';
import { format } from 'date-fns';
import { db } from '~/db';
import { statusMapped } from '~/components/models';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, pollId } = params;

  const poll = await db.pollTable.findUniqueOrThrow({
    where: { id: pollId, orgId: orgId },
    include: {
      User: true,
      PollQuestions: { include: { Votes: { select: { id: true } } } },
      Votes: { select: { id: true } },
    },
  });

  return json(poll);
}

export const action = async ({ request }: ActionFunctionArgs) => {};

export default function Index() {
  const poll = useLoaderData<typeof loader>();

  const maxVotes = Math.max(...poll.PollQuestions.map((e) => e.Votes.length));

  return (
    <Modal title="Detalji ankete">
      <div className="flex flex-col gap-8 p-8">
        <div className="grid grid-cols-2 gap-x-8 self-start">
          <div className="">Naziv ankete</div>
          <div className="font-semibold">{poll.name}</div>

          <div className="">Status</div>
          <div className="font-semibold">{statusMapped[poll.status]}</div>

          <div className="">Anketu kreirao</div>
          <div className="font-semibold">{poll.User.name}</div>

          <div className="">Vrijeme kreiranja</div>
          <div className="font-semibold">
            {format(poll.createdAt, 'dd.MM.yyyy. HH:mm')}
          </div>

          <div className="">Vrijeme završetka</div>
          <div className="font-semibold">
            {format(poll.createdAt, 'dd.MM.yyyy. HH:mm')}
          </div>
        </div>

        <div className="grid grid-cols-[auto_80px] items-center gap-x-2 gap-y-1 self-start">
          {poll.PollQuestions.map((e) => (
            <>
              <div
                className={`rounded p-2 px-4 ${e.Votes.length === maxVotes ? 'bg-green-100' : 'bg-slate-100'} `}
              >
                {e.name}
              </div>
              <div className="text-right">{e.Votes.length}</div>
            </>
          ))}
          <div className="mt-4 px-4 text-right font-semibold">
            Ukupan broj glasova
          </div>
          <div className="mt-4 text-right">{poll.Votes.length}</div>
        </div>
      </div>
    </Modal>
  );
}
