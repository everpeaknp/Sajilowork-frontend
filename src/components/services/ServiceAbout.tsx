'use client';

import { getServiceAbout, type Service } from './serviceListData';

interface ServiceAboutProps {
  service: Service;
}

function MetaColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-base font-normal text-black">{title}</h3>
      <p className="mt-2 text-sm font-normal leading-relaxed text-neutral-600">{items.join(', ')}</p>
    </div>
  );
}

export default function ServiceAbout({ service }: ServiceAboutProps) {
  const about = getServiceAbout(service);

  return (
    <section className="border-b border-neutral-200 pb-10 pt-10">
      <h2 className="text-2xl font-normal tracking-tight text-black sm:text-[28px]">About</h2>

      <p className="mt-6 max-w-3xl text-sm font-normal leading-[1.85] text-neutral-600 sm:text-[15px]">
        {about.intro}
      </p>

      <p className="mt-8 text-sm font-normal text-black sm:text-[15px]">Services I provide:</p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm font-normal leading-relaxed text-neutral-600 sm:text-[15px]">
        {about.servicesProvided.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>

      <p className="mt-8 max-w-3xl text-sm font-normal leading-[1.85] text-neutral-600 sm:text-[15px]">
        {about.outro}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
        <MetaColumn title="App type" items={about.appTypes} />
        <MetaColumn title="Design tool" items={about.designTools} />
        <MetaColumn title="Device" items={about.devices} />
      </div>
    </section>
  );
}
