import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // return redirect("active-orgs");

  const { orgId } = params;

  const data = await db.userTable.findUniqueOrThrow({ where: { id: orgId } });
  return json(data);
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return <div>{`${data.name} ${data.email}`}</div>;
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
