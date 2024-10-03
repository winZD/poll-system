// app/routes/logout.js or .ts
import { json } from '@remix-run/node';
import { db } from '~/db';
import { getPollData } from '~/functions/getPollData';

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
    polls.map((e) => getPollData({ orgId, pollId: e.id })),
  );

  return json(result);
}
