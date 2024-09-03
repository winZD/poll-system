import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // return redirect("active-orgs");

  const { orgId } = params;

  const org = await db.orgTable.findUniqueOrThrow({ where: { id: orgId } });
  return json(org);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const org = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col p-4">
      <div className="flex gap-8">
        <div>{`Korisnik: ${org.name} `}</div>
        <div>{`Email: ${org.email} `}</div>
      </div>
    </div>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
