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
    <div className="flex aspect-video w-[1920px] flex-col justify-end border-2 p-8">
      {/* <div className="border-b bg-slate-50 p-4 text-center font-extrabold">
        {tvPoll.name}
      </div> */}

      <div className="flex items-center justify-end gap-16 text-lg">
        <div className="flex flex-col gap-8">
          <div className="font-semibold"> {poll.name}</div>

          <div className="flex flex-col gap-2">
            {poll.PollQuestions.map((e) => {
              const questionVotes =
                votes.find((v) => v.pollQuestionId === e.id)?._count || 0;

              const percent = (questionVotes / totalVotes) * 100;

              return (
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex flex-1 justify-between gap-16 overflow-hidden rounded-lg bg-slate-100 px-2 py-1">
                    <div
                      className="absolute bottom-0 left-0 top-0 bg-green-500 opacity-20"
                      style={{ width: `${percent}%` }}
                    />
                    <div key={e.id} className={``}>
                      {e.name}
                    </div>
                    <div>{questionVotes}</div>
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
        <QRCodeSVG size={128} value={poll.iframeSrc} />
      </div>
    </div>
  );
};

export default Index;
