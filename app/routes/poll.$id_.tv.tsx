import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '~/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  console.log(params);
  const { id } = params;

  const poll = await db.pollTable.findUniqueOrThrow({
    where: { id },
    include: {
      Org: true,
      PollQuestions: true,
    },
  });
  const votes = await db.votesTable.groupBy({
    by: ['pollQuestionId'],
    where: { pollId: id },
    _count: true,
  });
  return { poll, votes };
}

const Index = () => {
  const { poll, votes } = useLoaderData<typeof loader>();

  const totalVotes = votes.reduce((acc, current) => acc + current._count, 0);

  return (
    <div className="flex aspect-video w-[1920px] flex-col justify-end bg-green-50">
      {/* <div className="border-b bg-slate-50 p-4 text-center font-extrabold">
        {tvPoll.name}
      </div> */}

      <div className="flex items-end justify-end gap-16">
        <div className="flex flex-col">
          <div className="font-semibold"> {poll.name}</div>

          <div className="flex flex-col gap-2">
            {poll.PollQuestions.map((e) => (
              <>
                <button key={e.id} className={`rounded px-4 py-2`}>
                  {e.name}
                </button>
              </>
            ))}
          </div>
          <div>{`Ukupno glasova ${totalVotes}`}</div>
        </div>
        <QRCodeSVG size={64} value={poll.iframeSrc} />
      </div>
    </div>
  );
};

export default Index;
