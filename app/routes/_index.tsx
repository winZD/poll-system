import { LoaderFunctionArgs, redirect } from '@remix-run/node';

import { getUserFromRequest } from '~/auth';
import { roleValues } from '~/components/models';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const token = decode

  const user = await getUserFromRequest(request);

  if (!user) return null;

  return redirect(
    user?.Org.role === roleValues.ADMIN
      ? '/app/admin'
      : `/app/org/${user?.Org.id}`,
  );
}

export default function Index() {
  return <div />;
}
