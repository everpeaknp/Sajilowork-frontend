'use client';

import { getServiceAbout, type Service } from './serviceListData';

interface ServiceAboutProps {
  service: Service;
}

function MetaColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-base font-normal text-black dark:text-stone-100">{title}</h3>
      <p className="mt-2 text-sm font-normal leading-relaxed text-neutral-600 dark:text-neutral-400">{items.join(', ')}</p>
    </div>
  );
}

export default function ServiceAbout({ service }: ServiceAboutProps) {
  const about = getServiceAbout(service);
  const hasMetaColumns = about.appTypes.length > 0 || about.devices.length > 0;

  return (
    <section className="border-b border-neutral-200 pb-10 pt-10 dark:border-neutral-800">
      <h2 className="text-2xl font-normal tracking-tight text-black sm:text-[28px] dark:text-stone-100">About</h2>

      {about.intro ? (
        <p className="mt-6 max-w-3xl whitespace-pre-line text-sm font-normal leading-[1.85] text-neutral-600 sm:text-[15px] dark:text-neutral-400">
          {about.intro}
        </p>
      ) : null}

      {about.skills.length > 0 ? (
        <div className="mt-8">
          <p className="text-sm font-normal text-black sm:text-[15px] dark:text-stone-100">Skills</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full bg-[#ffede8] px-4 py-2 text-sm font-normal tracking-tight text-black dark:bg-neutral-800 dark:text-stone-200"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {about.outro ? (
        <p className="mt-8 max-w-3xl whitespace-pre-line text-sm font-normal leading-[1.85] text-neutral-600 sm:text-[15px] dark:text-neutral-400">
          {about.outro}
        </p>
      ) : null}

      {hasMetaColumns ? (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6">
          {about.appTypes.length > 0 ? (
            <MetaColumn title="App type" items={about.appTypes} />
          ) : null}
          {about.devices.length > 0 ? (
            <MetaColumn title="Device" items={about.devices} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
