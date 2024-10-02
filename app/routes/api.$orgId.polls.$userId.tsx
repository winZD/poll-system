// app/routes/logout.js or .ts
import { json } from '@remix-run/node';
import { db } from '~/db';

export async function loader({ request, params }) {
  const { orgId, userId } = params;

  const user = await db.userTable.findUnique({ where: { id: userId, orgId } });

  if (!user || !user.permissions.includes('R')) {
    return json(null);
  }

  const polls = await db.pollTable.findMany({
    where: { orgId: orgId },
    include: { Org: true, PollQuestions: true, Votes: true },
  });

  return json(polls);
}
