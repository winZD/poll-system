import { ulid } from 'ulid';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Sample data for TV networks and real names
const orgNames = [
  'TV ADMIN',
  'NOVA TV',
  'RTL',
  'Z1',
  'CBS',
  'ABC',
  'FOX',
  'CNN',
  'BBC',
  'ESPN',
  'HBO',
  'MTV',
  'TBS',
  'Discovery',
  'National Geographic',
  'Comedy Central',
  'PBS',
  'CW',
  'Telemundo',
  'Univision',
  'Syfy',
  'AMC',
  'Bravo',
];

const userNames = [
  'Ivan Horvat',
  'Ana Kovačić',
  'Marko Babić',
  'Petra Novak',
  'Josip Perić',
  'Marija Jurić',
  'Tomislav Marić',
  'Ivana Radić',
  'Luka Pavlović',
  'Katarina Grgić',
  'Matej Šarić',
  'Martina Vuković',
  'Filip Petrović',
  'Nikolina Matić',
  'Ante Božić',
  'Lucija Krpan',
  'Stjepan Blažević',
  'Ivanka Bogdanović',
  'Franjo Vranić',
  'Maja Vidić',
  'Zoran Herceg',
  'Dubravka Mikulić',
  'Hrvoje Zorić',
  'Vesna Barišić',
  'Goran Mišetić',
  'Zrinka Lasić',
  'Davor Milinović',
  'Sanja Dukić',
  'Krešimir Blažić',
  'Helena Vukman',
  'Nina Čičak',
  'Branimir Pejić',
  'Tihana Kušec',
  'Vladimir Župan',
  'Tea Lončar',
  'Damir Lovrić',
  'Suzana Miletić',
  'Vinko Maček',
  'Tanja Ljubić',
  'Darko Rašić',
];

async function main() {
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < orgNames.length; i++) {
      const org = await tx.orgTable.create({
        data: {
          id: ulid(),
          email: `${orgNames[i].toLowerCase().replace(/\s+/g, '')}@example.com`,
          name: orgNames[i],
          role: i === 0 ? 'ADMIN' : 'ORG', // First org as ADMIN, others as ORG
          status: 'ACTIVE',
        },
      });

      for (let j = 0; j < 5; j++) {
        const userName = userNames[(i * 5 + j) % userNames.length];

        console.log(
          `${userName.toLowerCase().replace(/\s+/g, '')}${(i * j).toString()}@example.com`,
        );

        await tx.userTable.create({
          data: {
            id: `user-${i + 1}-${j + 1}`,
            orgId: org.id,
            email: `${userName.toLowerCase().replace(/\s+/g, '')}${(i + j).toString()}@example.com`,
            name: userName,
            password: `password${j + 1}`, // Normally you'd hash this
            role: j === 0 ? 'ADMIN' : 'USER', // First user as ADMIN, others as USER
            permissions:
              j === 0
                ? 'CRUD'
                : j === 1
                  ? 'CRUD'
                  : j === 2
                    ? 'C'
                    : j === 3
                      ? 'R'
                      : j === 4
                        ? 'U'
                        : 'D',
            status: 'ACTIVE',
          },
        });
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
