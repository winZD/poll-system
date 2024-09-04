import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { Form, json, useLoaderData } from '@remix-run/react';
import React from 'react';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { Modal } from '~/components/Modal';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HookForm } from '~/components/Form/Form';
import InputField from '~/components/Form/FormInput';
import { db } from '~/utils/db';
import { ulid } from 'ulid';
import { hashPassword } from '~/utils';

const schema = zod.object({
  name: zod.string().min(1),
  email: zod.string().email('Neispravan email').min(1),
  password: zod.string().min(1),
});

type FormData = zod.infer<typeof schema>;

const resolver = zodResolver(schema);

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { orgId, pollId } = params;

  const poll = await db.pollTable.findUniqueOrThrow({
    where: { id: pollId, orgId: orgId },
    include: {
      User: true,
      PollQuestions: true,
      Votes: { select: { id: true } },
    },
  });

  return json(poll);
}

export const action = async ({ request }: ActionFunctionArgs) => {};

export default function Index() {
  const poll = useLoaderData<typeof loader>();

  return (
    <Modal title="Detalji ankete">
      <div className="flex flex-col gap-4 p-8">
        <div className="font-semibold">{poll.name}</div>
        <div className="flex flex-col gap-1">
          {poll.PollQuestions.map((e) => (
            <div className="rounded bg-slate-100 p-2 px-4">{e.name}</div>
          ))}
        </div>
        <div className="px-4 text-right font-semibold">{`Ukupan broj glasova ${poll.Votes.length}`}</div>
      </div>
    </Modal>
  );
}

{
  /**
  
  
  - firme
  - neaktivne firme

  */
}
