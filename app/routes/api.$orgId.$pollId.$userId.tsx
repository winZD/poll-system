// app/routes/logout.js or .ts
import { json } from '@remix-run/node';
import { db } from '~/db';

export async function loader({ request, params }) {
  const { orgId, pollId, userId } = params;

  const user = await db.userTable.findUnique({ where: { id: userId, orgId } });

  if (!user || !user.permissions.includes('R')) {
    return json(null);
  }

  const poll = await db.pollTable.findUniqueOrThrow({
    where: { id: pollId, orgId: orgId },
    include: { Org: true, PollQuestions: true, Votes: true },
  });

  return json(poll);
}
