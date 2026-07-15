type Section = {
  title: string;
  body?: readonly string[];
  list?: readonly string[];
};

export function MarketingProse({ sections }: { sections: readonly Section[] }) {
  return (
    <article className="min-w-0 space-y-8 md:space-y-10">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="mb-3 text-lg font-bold text-brand-dark dark:text-stone-100 md:text-xl">
            {section.title}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-[#384179] dark:text-neutral-400 sm:text-base">
            {section.body?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.list && section.list.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}
    </article>
  );
}

export function MarketingLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-8 text-sm leading-relaxed text-[#6a719a] dark:text-neutral-400 sm:mb-10 sm:text-base">
      {children}
    </p>
  );
}
