import { ulid } from 'ulid';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Step 1: Fetch 5 existing organizations
    const orgs = await prisma.orgTable.findMany({
      take: 5,
      orderBy: { name: 'asc' },
    });

    for (const org of orgs) {
      // Step 2: Fetch users for each organization
      const users = await prisma.userTable.findMany({
        where: {
          orgId: org.id,
        },
      });

      for (const user of users) {
        // Step 3: Create a poll for each user with 3-4 poll questions
        const pollId = ulid(); // Generate a unique ID for the poll
        const poll = await prisma.pollTable.create({
          data: {
            id: pollId,
            orgId: org.id,
            userId: user.id,
            name: `Poll for ${user.name}`,
            createdAt: new Date(),
            expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)), // Expires in 7 days
            status: 'ACTIVE',
            iframeTitle: `Poll by ${user.name}`,
            iframeSrc: `http://localhost:5173/poll/${pollId}`,
          },
        });

        // Step 4: Create 3-4 poll questions (suggestions)
        const pollQuestions = [];
        for (let i = 1; i <= 4; i++) {
          if (i > 3) break; // Adjust this if you want exactly 3 or 4 questions
          const pollQuestion = await prisma.pollQuestionTable.create({
            data: {
              id: ulid(),
              orgId: org.id,
              pollId: poll.id,
              name: `Suggestion ${i} for ${poll.name}`,
            },
          });
          pollQuestions.push(pollQuestion);
        }

        console.log(
          `Created poll "${poll.name}" with ${pollQuestions.length} suggestions for user "${user.name}" in org "${org.name}"`,
        );
      }
    }
  } catch (error) {
    console.error('Error creating polls:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
