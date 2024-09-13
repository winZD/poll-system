import { json } from '@remix-run/node';
import { db } from '~/db';

export async function loader() {
  const polls = await db.pollTable.findMany({
    include: { Votes: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return json(polls);
}
