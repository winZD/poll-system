import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { PollLoaderType } from '~/routes/app.org.$orgId.polls.$pollId';

export const PollChartWithVotes = ({}: {}) => {
  const { t } = useTranslation();

  const { poll } = useLoaderData<PollLoaderType>();

  const maxVotes =
    Math.max(...poll.PollQuestions.map((e) => e.votes.total || 0)) || 0;

  const totalVotes = poll.totalVotes;

  return (
    <div className="flex flex-col gap-8">
      <div className="font-semibold"> {poll.name}</div>

      <div className="flex flex-col gap-2">
        {poll.PollQuestions.map((e) => {
          const questionVotes = e.votes.total || 0;

          const percent = (questionVotes / totalVotes || 0) * 100;

          return (
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex flex-1 justify-between gap-16 overflow-hidden rounded-lg bg-slate-100 px-2 py-1">
                <div
                  className={`absolute bottom-0 left-0 top-0 ${maxVotes === questionVotes ? 'bg-green-400' : 'bg-green-200'}`}
                  style={{ width: `${percent}%` }}
                />
                <div
                  key={e.id}
                  className={`z-10 ${maxVotes === questionVotes ? 'font-semibold' : ''}`}
                >
                  {e.name}
                </div>
                <div className="z-10">{questionVotes}</div>
              </div>
              <div className="w-20 text-right">
                {percent.toLocaleString('hr-HR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                %
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-4 px-2">
        <div className="flex-1 text-right">{t('totalVotes')}</div>
        <div>{`${totalVotes}`}</div>
        <div className="w-20 text-right"></div>
      </div>
    </div>
  );
};
