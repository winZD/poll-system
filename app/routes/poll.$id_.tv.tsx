import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { QRCodeSVG } from 'qrcode.react';
import { PollChartWithVotes } from '~/components/PollChartWithVotes';
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

  return (
    <div className="flex aspect-video w-[1920px] flex-col justify-end border-2 p-8">
      {/* <div className="border-b bg-slate-50 p-4 text-center font-extrabold">
        {tvPoll.name}
      </div> */}

      <div className="flex items-center justify-end gap-16 text-lg">
        <PollChartWithVotes poll={poll} votes={votes} />
        <QRCodeSVG size={128} value={poll.iframeSrc} />
      </div>
    </div>
  );
};

export default Index;
