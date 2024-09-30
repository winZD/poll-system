import { db } from '~/db';

export async function getPollData({ id }: { id: string }) {
  // Query to fetch poll details using Prisma queryRaw
  const poll = await db.pollTable.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      expiresAt: true,
      name: true,
      iframeSrc: true,
      status: true,
      PollQuestions: { select: { id: true, name: true } },
    },
  });

  // Group votes by poll question and count
  const votes = await db.votesTable.groupBy({
    by: ['pollQuestionId'],
    where: { pollId: id },
    _count: true,
  });
  return { poll, votes };
}
