import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData, useSearchParams } from '@remix-run/react';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // return redirect("active-orgs");

  const { orgId } = params;

  const org = await db.orgTable.findUniqueOrThrow({
    where: { id: orgId },
    include: { Users: true, Polls: true },
  });
  return json(org);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const org = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTab = searchParams.get('tab');

  return (
    <div className="flex flex-col gap-8 p-4">
      <div className="flex gap-8 font-bold">
        <div>{`Organizacija: ${org.name} `}</div>
        <div>{`Email: ${org.email} `}</div>
      </div>

      <div className="text-primary-900 flex border-b border-b-neutral-200 font-semibold">
        <div
          onClick={() => {
            const params = new URLSearchParams();
            params.set('tab', 'korisnici');
            setSearchParams(params);
          }}
          className={`cursor-pointer rounded-t-lg px-4 py-1 ${
            searchParams.get('tab') === 'korisnici' ? 'bg-neutral-200' : ''
          }`}
        >
          Korisnici
        </div>
        <div
          onClick={() => {
            const params = new URLSearchParams();
            params.set('tab', 'ankete');
            setSearchParams(params);
          }}
          className={`cursor-pointer rounded-t-lg px-4 py-1 ${
            searchParams.get('tab') === 'ankete' ? 'bg-neutral-200' : ''
          }`}
        >
          Ankete
        </div>
      </div>

      {searchParams.get('tab') === 'korisnici' && (
        <div className="flex flex-col">
          {org.Users.map((user) => (
            <div className="flex gap-4">
              <div>{user.name}</div>
              <div>{user.email}</div>
              <div>{user.role}</div>
              <div>{user.permissions}</div>
            </div>
          ))}
        </div>
      )}
      {searchParams.get('tab') === 'ankete' && (
        <div className="flex flex-col">
          {org.Polls.map((poll) => (
            <div className="flex gap-4">
              <div>{poll.name}</div>
              <div>{poll.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
