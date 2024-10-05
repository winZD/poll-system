import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { QRCodeSVG } from 'qrcode.react';
import { PollChartWithVotes } from '~/components/PollChartWithVotes';
import { getPollDetails } from '~/functions/getPollDetails';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { pollId, orgId } = params;
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const { poll } = await getPollDetails({
    pollId: pollId as string,
    orgId: orgId as string,
  });

  return { poll, baseUrl };
}

const Index = () => {
  const { baseUrl } = useLoaderData<typeof loader>();
  const { orgId, pollId } = useParams();

  return (
    <div className="flex aspect-video w-[1920px] flex-col justify-end border-2 p-8">
      {/* <div className="border-b bg-slate-50 p-4 text-center font-extrabold">
        {tvPoll.name}
      </div> */}

      <div className="flex items-center justify-end gap-16 text-lg">
        <PollChartWithVotes />
        <QRCodeSVG size={128} value={`${baseUrl}/poll/${orgId}/${pollId}`} />
      </div>
    </div>
  );
};

export default Index;
