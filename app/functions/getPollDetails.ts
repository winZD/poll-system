import { db } from '~/db';

export async function getPollDetails({
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
  const voteCount = await db.votesTable.groupBy({
    by: ['pollQuestionId'],
    where: { pollId },
    _count: true,
  });

  const countryGroup = await db.votesTable.groupBy({
    by: ['pollQuestionId', 'country'],
    where: { pollId },
    _count: true,
  });
  const regionGroup = await db.votesTable.groupBy({
    by: ['pollQuestionId', 'region'],
    where: { pollId },
    _count: true,
  });
  const cityGroup = await db.votesTable.groupBy({
    by: ['pollQuestionId', 'city'],
    where: { pollId },
    _count: true,
  });

  // console.log({ temp: groupedVotes });

  return {
    poll: {
      ...poll,
      PollQuestions: poll.PollQuestions.map((pq) => {
        return {
          ...pq,
          votes: {
            total: voteCount.find((e) => e.pollQuestionId === pq.id)?._count,
            cities: cityGroup
              .filter((e) => e.pollQuestionId === pq.id)
              .map((e) => ({ ...e, name: e.city })),
            countries: countryGroup
              .filter((e) => e.pollQuestionId === pq.id)
              .map((e) => ({ ...e, name: e.country })),
            regions: regionGroup
              .filter((e) => e.pollQuestionId === pq.id)
              .map((e) => ({ ...e, name: e.region })),
          },
        };
      }),
      totalVotes: voteCount.reduce((acc, current) => acc + current._count, 0),
    },
  };
}
