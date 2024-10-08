import { LoaderFunctionArgs, redirect } from '@remix-run/node';

import { getUserFromRequest } from '~/auth';
import { roleValues } from '~/components/models';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);

  return redirect(
    user?.Org.role === roleValues.ADMIN
      ? '/app/admin'
      : `/app/org/${user?.Org.id}`,
  );
}
