import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useParams, useSubmit } from '@remix-run/react';
import { db } from '~/db';
import { assert, toHrDateString } from '~/utils';
import crypto from 'crypto'; // If using ES Modules
import { jsonWithError, jsonWithInfo, jsonWithSuccess } from 'remix-toast';
import { ulid } from 'ulid';
import { getClientIPAddress } from '~/functions/get-client-ip-address';
import { getPollDetails } from '~/functions/getPollDetails';
import React from 'react';
import { serialize } from 'cookie';
import { addMinutes, addMonths } from 'date-fns';
import { parse } from 'cookie';
import i18next from '~/i18n.server';
import { useTranslation } from 'react-i18next';

const towns = [
  { country: 'hr', name: 'Zagreb', lat: 45.815, lon: 15.9819 },
  { country: 'hr', name: 'Split', lat: 43.5081, lon: 16.4402 },
  { country: 'hr', name: 'Rijeka', lat: 45.3271, lon: 14.4422 },
  { country: 'hr', name: 'Osijek', lat: 45.554, lon: 18.6955 },
  { country: 'hr', name: 'Zadar', lat: 44.1194, lon: 15.2314 },
  { country: 'hr', name: 'Velika Gorica', lat: 45.712, lon: 16.0753 },
  { country: 'hr', name: 'Slavonski Brod', lat: 45.1603, lon: 18.0156 },
  { country: 'hr', name: 'Pula', lat: 44.8666, lon: 13.8496 },
  { country: 'hr', name: 'Karlovac', lat: 45.4875, lon: 15.5476 },
  { country: 'hr', name: 'Varaždin', lat: 46.3057, lon: 16.3366 },
  { country: 'hr', name: 'Krapina', lat: 46.16, lon: 15.878 },
  { country: 'hr', name: 'Sisak', lat: 45.4876, lon: 16.3756 },
  { country: 'hr', name: 'Koprivnica', lat: 46.162, lon: 16.8274 },
  { country: 'hr', name: 'Bjelovar', lat: 45.8986, lon: 16.8489 },
  { country: 'hr', name: 'Gospić', lat: 44.5469, lon: 15.3744 },
  { country: 'hr', name: 'Virovitica', lat: 45.8319, lon: 17.3839 },
  { country: 'hr', name: 'Požega', lat: 45.3405, lon: 17.6857 },
  { country: 'hr', name: 'Šibenik', lat: 43.735, lon: 15.8895 },
  { country: 'hr', name: 'Vukovar', lat: 45.3511, lon: 19.0027 },
  { country: 'hr', name: 'Dubrovnik', lat: 42.6507, lon: 18.0944 },
  { country: 'hr', name: 'Čakovec', lat: 46.3844, lon: 16.433 },
];

// Haversine formula to calculate distance between two points
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

function findClosestTown(lat: number, lon: number) {
  let closestTown: { name: string; country: string } | undefined;

  let minDistance = Infinity;

  for (const town of towns) {
    const distance = getDistance(lat, lon, town.lat, town.lon);
    if (distance < minDistance) {
      minDistance = distance;
      closestTown = town;
    }
  }

  return closestTown;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, pollId } = params;

  assert(orgId && pollId);

  const { poll } = await getPollDetails({
    pollId: pollId as string,
    orgId: orgId as string,
  });

  const userAgent = request.headers.get('user-agent'); // Get user agent
  const forwardedFor = request.headers.get('x-forwarded-for'); // Get forwarded IP
  const ipAddress = getClientIPAddress(request);

  const cookies = parse(request.headers.get('Cookie') ?? '');
  const alreadyVotedQuestionId = cookies[pollId]; //

  let localeFromReq = await i18next.getLocale(request);

  const locale = cookies['lng'] ? cookies['lng'] : localeFromReq;

  const t = await i18next.getFixedT(locale);

  if (alreadyVotedQuestionId && alreadyVotedQuestionId !== 'null') {
    return jsonWithInfo(
      {
        poll,
        existingVote: alreadyVotedQuestionId,
      },
      t('voted'),
    );
  }

  const dataToHash = `${userAgent}-${forwardedFor}-${ipAddress}`;
  const fingerPrint = crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex'); // Output as a hex string

  const existingVote = await db.votesTable.findFirst({
    where: {
      pollId,
      fingerPrint,
      createdAt: { lte: addMinutes(new Date(), -5) },
    },
  });

  return jsonWithInfo(
    {
      poll,
      existingVote: existingVote?.pollQuestionId,
    },
    t('recordedVote'),
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  let localeFromReq = await i18next.getLocale(request);

  const cookieHeader = request.headers.get('Cookie') || '';

  const cookies = parse(cookieHeader);

  const locale = cookies['lng'] ? cookies['lng'] : localeFromReq;

  const t = await i18next.getFixedT(locale);
  const formData = await request.formData();

  const orgId = formData.get('orgId')?.toString();
  const pollId = formData.get('pollId')?.toString();
  const pollQuestionId = formData.get('pollQuestionId')?.toString();
  const loc = formData.get('loc')?.toString();

  if (!orgId || !pollId || !pollQuestionId)
    return jsonWithError(null, t('error'));

  const userAgent = request.headers.get('user-agent'); // Get user agent
  const forwardedFor = request.headers.get('x-forwarded-for'); // Get forwarded IP
  const ipAddress = getClientIPAddress(request);

  const dataToHash = `${userAgent}-${forwardedFor}-${ipAddress}`;

  const fingerPrint = crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex'); // Output as a hex string

  const [lat, lon] = loc ? loc?.split(',') : [];

  const town = lat && lon ? findClosestTown(+lat, +lon) : null;

  if (request.method === 'DELETE') {
    // DEV ONLY
    await db.votesTable.deleteMany({ where: { orgId, pollId, fingerPrint } });
    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      serialize(pollId, pollQuestionId, {
        path: '/',
        sameSite: 'lax',
        domain: process.env.COOKIE_DOMAIN,
        expires: new Date(0),
      }),
    );
    return jsonWithInfo({}, t('deletedVote'), { headers });
  } else if (request.method === 'POST') {
    //
    const id = ulid();
    await db.votesTable.create({
      data: {
        fingerPrint,
        id,
        orgId,
        pollId,
        pollQuestionId,
        ipAddress,
        loc,
        city: town?.name?.toLowerCase(),
        country: town?.country?.toLowerCase(),
        userAgent,
      },
    });

    //ako lokaciju nismo dobili s fronta onda grad pokusamo dobiti iz IP adrese...
    if (!loc && ipAddress) {
      fetch(`https://ipinfo.io/${ipAddress}/json`)
        .then(async (res) => {
          const data = await res.json();
          try {
            await db.votesTable.update({
              where: { id },
              data: {
                hostname: data.hostname,
                city: data.city,
                // region: data.region,
                country: data.country,
                loc: data.loc,
                org: data.org,
                // postal: data.postal,
                // timezone: data.timezone,
              },
            });
          } catch (e) {
            console.log('error updating ip details', { e });
          }
        })
        .catch((e) => console.log('error fetching  ip details'));
    }
  }

  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    serialize(pollId, pollQuestionId, {
      path: '/',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
      expires: addMonths(new Date(), 12),
    }),
  );

  return jsonWithSuccess({}, t('successfullyRecordedVote'), { headers });
};

export default function Index() {
  const { t } = useTranslation();
  const { poll, existingVote } = useLoaderData<typeof loader>();

  const ukupnoGlasova = poll.totalVotes || 0;
  const maxBrojGlasova = Math.max(
    ...poll.PollQuestions.map((e) => e.votes.total || 0),
  );

  const submit = useSubmit();

  const [geo, setGeo] = React.useState<{ lat: number; lon: number }>();

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGeo({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      });
    }
  }, []);

  const { orgId, pollId } = useParams();

  assert(orgId && pollId);

  return (
    <>
      {/* <pre>{JSON.stringify({ geo }, null, 2)}</pre> */}
      <div className="flex flex-col self-start">
        {/* <div className="border-b p-4 text-center">{poll.Org.name}</div> */}
        <div className="flex flex-col gap-6 px-8 py-4">
          <div className="text-center font-semibold">{poll.name}</div>

          {existingVote && (
            <div className="flex flex-col text-center">
              <div>{t('voted')}</div>
              <button
                onClick={() =>
                  submit(
                    {
                      pollQuestionId: 'null',
                      orgId: orgId,
                      pollId: poll.id,
                    },
                    { method: 'DELETE' },
                  )
                }
                className={`rounded bg-red-100 px-4 py-2 hover:bg-blue-100`}
              >
                {'ukloni glas (DEV ONLY)'}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {poll.PollQuestions.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  if (existingVote) return;
                  submit(
                    {
                      pollQuestionId: e.id,
                      orgId: orgId,
                      pollId: poll.id,
                      loc: geo ? `${geo?.lat},${geo?.lon}` : null,
                    },
                    { method: 'POST' },
                  );
                }}
                className={`rounded px-4 py-2 ${existingVote ? 'cursor-default' : 'hover:bg-blue-100'} ${existingVote === e.id ? 'bg-green-100' : 'bg-blue-50'}`}
              >
                {e.name}
              </button>
            ))}
          </div>

          {existingVote && (
            <div className="text-center font-semibold">{`Ukupan broj glasova ${ukupnoGlasova}`}</div>
          )}

          <div className="flex gap-8">
            <div className="">{t('pollExpiration')}</div>
            <div className="font-semibold">
              {toHrDateString(poll.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
