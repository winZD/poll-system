import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker'; // Optional for generating random data
import { ulid } from 'ulid';

const prisma = new PrismaClient();

async function generateVotes(orgId, pollId, numVotes) {
  const citiesAndRegions = [
    { city: 'Zagreb', region: 'Zagreb' },
    { city: 'Split', region: 'Split-Dalmatia' },
    { city: 'Rijeka', region: 'Primorje-Gorski Kotar' },
    { city: 'Osijek', region: 'Osijek-Baranja' },
    { city: 'Zadar', region: 'Zadar' },
    // Add more Croatian cities and regions here
  ];

  const questions = await prisma.pollQuestionTable.findMany({
    where: { pollId, orgId },
  });

  const votesData = Array.from({ length: numVotes }).map(() => {
    const randomCityAndRegion =
      citiesAndRegions[Math.floor(Math.random() * citiesAndRegions.length)];
    const question = questions[Math.floor(Math.random() * questions.length)];

    return {
      id: ulid(),
      pollId,
      orgId,
      pollQuestionId: question.id, // Use actual pollQuestionId if you have it
      fingerPrint: faker.internet.mac(),
      city: randomCityAndRegion.city,
      region: randomCityAndRegion.region,
      country: 'HR', // Croatia
      ipAddress: faker.internet.ip(),
      hostname: faker.internet.domainName(),
      loc: `${faker.location.latitude()},${faker.location.longitude()}`,
      timezone: faker.location.timeZone(),
    };
  });

  await prisma.votesTable.createMany({
    data: votesData,
  });

  console.log(`${numVotes} votes generated for pollId: ${pollId}`);
}

async function main() {
  const orgId = '01J71DXA79DW4Q5MVE7DHGZZ4C'; // Replace with actual orgId
  const pollId = '01J7XR96AFPB21JEJV8FZB9D4D'; // Replace with actual pollId
  const numVotes = 100;

  await generateVotes(orgId, pollId, numVotes);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
