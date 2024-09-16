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
    },
  });
  return poll;
}

const Index = () => {
  const tvPoll = useLoaderData<typeof loader>();
  return (
    <div className="m-auto flex flex-col rounded border shadow-lg">
      {/* <div className="border-b bg-slate-50 p-4 text-center font-extrabold">
        {tvPoll.name}
      </div> */}
      <div className="flex items-center justify-center gap-6 px-8 py-4">
        <div className="font-semibold"> {tvPoll.name}</div>
        <QRCodeSVG size={64} value={tvPoll.iframeSrc} />
      </div>
    </div>
  );
};

export default Index;
