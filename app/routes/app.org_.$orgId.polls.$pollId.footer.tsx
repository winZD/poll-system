import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { QRCodeSVG } from 'qrcode.react';
import { PollChartWithVotes } from '~/components/PollChartWithVotes';
import { getPollData } from '~/functions/getPollData';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { pollId, orgId } = params;

  const { poll, votes } = await getPollData({
    pollId: pollId as string,
    orgId: orgId as string,
  });

  return { poll, votes };
}

export type PollLoaderType = typeof loader;

const Index = () => {
  const { poll } = useLoaderData<typeof loader>();

  return (
    <div className="flex aspect-video w-[1920px] flex-col justify-end border-2 p-8">
      {/* <div className="border-b bg-slate-50 p-4 text-center font-extrabold">
        {tvPoll.name}
      </div> */}

      <div className="flex items-center justify-end gap-16 text-lg">
        <PollChartWithVotes />
        <QRCodeSVG size={128} value={poll.iframeSrc} />
      </div>
    </div>
  );
};

export default Index;
