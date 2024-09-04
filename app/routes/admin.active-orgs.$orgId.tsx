import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import {
  json,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { jsonWithSuccess, redirectWithSuccess } from 'remix-toast';
import { Button } from '~/components/Button';
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

export default function Index() {
  const org = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTab = searchParams.get('tab') || 'korisnici';

  const submit = useSubmit();

  return (
    <div className="flex flex-col items-start gap-8 p-4">
      <Button
        onClick={() =>
          submit(
            { action: 'DEACTIVATE', orgId: org.id },
            { method: 'post', action: '/admin' },
          )
        }
      >
        Deaktiviraj
      </Button>
      <div className="flex flex-col gap-2 font-semibold">
        <div>{`${org.name} `}</div>
        <div>{`${org.email} `}</div>
      </div>

      <div className="text-primary-900 flex border-b border-b-neutral-200 font-semibold">
        <div
          onClick={() => {
            const params = new URLSearchParams();
            params.set('tab', 'korisnici');
            setSearchParams(params);
          }}
          className={`cursor-pointer rounded-t px-4 py-1 ${
            selectedTab === 'korisnici' ? 'bg-neutral-200' : ''
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
          className={`cursor-pointer rounded-t px-4 py-1 ${
            selectedTab === 'ankete' ? 'bg-neutral-200' : ''
          }`}
        >
          Ankete
        </div>
      </div>

      {selectedTab === 'korisnici' && (
        <div className="flex flex-col self-start">
          <div className="grid grid-cols-[200px_260px_120px_80px_100px] bg-slate-200 p-1 font-semibold">
            <div>Ime</div>
            <div>Email</div>
            <div>Rola</div>
            <div>Ovlasti</div>
            <div>Status</div>
          </div>
          {org.Users.map((user) => (
            <div className="grid grid-cols-[200px_260px_120px_80px_100px] p-1">
              <div>{user.name}</div>
              <div>{user.email}</div>
              <div>{user.role}</div>
              <div>{user.permissions}</div>
              <div>{user.status}</div>
            </div>
          ))}
        </div>
      )}
      {selectedTab === 'ankete' && (
        <div className="flex flex-col self-start">
          <div className="grid grid-cols-[300px_200px] bg-slate-200 p-1 font-semibold">
            <div>Anketa</div>
            <div>Status</div>
          </div>

          {org.Polls.map((poll) => (
            <div className="grid grid-cols-[300px_200px] p-1">
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
