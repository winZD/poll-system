import { db } from '~/db';

export async function getPollData({
  orgId,
  pollId,
}: {
  orgId: string;
  pollId: string;
}) {
  // Query to fetch poll details using Prisma queryRaw
  const poll = await db.pollTable.findUniqueOrThrow({
    where: { id: pollId, orgId },
    select: {
      id: true,
      createdAt: true,
      expiresAt: true,
      name: true,
      iframeSrc: true,
      status: true,
      PollQuestions: { select: { id: true, name: true, pollId: true } },
    },
  });

  // Group votes by poll question and count
  const votes = await db.votesTable.groupBy({
    by: ['pollQuestionId'],
    where: { pollId },
    _count: true,
  });
  return { poll, votes };
}
