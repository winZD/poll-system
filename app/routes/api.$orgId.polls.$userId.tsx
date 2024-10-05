// app/routes/logout.js or .ts
import { json } from '@remix-run/node';
import { db } from '~/db';
import { getPollDetails } from '~/functions/getPollDetails';

export async function loader({ request, params }) {
  const { orgId, userId } = params;

  const user = await db.userTable.findUnique({ where: { id: userId, orgId } });

  if (!user || !user.permissions.includes('R')) {
    return json(null);
  }

  const polls = await db.pollTable.findMany({
    where: { orgId: orgId },
  });

  const result = await Promise.all(
    polls.map((e) => getPollDetails({ orgId, pollId: e.id })),
  );

  return json(result);
}
