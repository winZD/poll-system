import { LoaderFunctionArgs, ActionFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { redirectWithError } from 'remix-toast';
import { db } from '~/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const pollId = params.id;

  const poll = await db.pollTable.findUnique({
    where: { id: pollId },
  });

  if (!poll) return redirectWithError('..', 'Nepostojeća anketa');

  return json(poll);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const poll = useLoaderData<typeof loader>();
  console.log(poll);
  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-4 text-center text-3xl font-bold">POll</div>
        <p className="text-center text-sm text-gray-600">
          This is a small card with some sample content. You can add more
          information here.
        </p>
        <div className="mt-4 flex justify-center">
          <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            Action
          </button>
        </div>
      </div>
    </div>
  );
}
