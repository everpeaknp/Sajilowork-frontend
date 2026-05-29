const SECTIONS = [
  {
    title: 'Who can cancel',
    body: [
      'The task poster (customer) or the assigned tasker may cancel a task, depending on its status.',
      'Completed or already cancelled tasks cannot be cancelled again.',
      'Cancellations must be done through the platform so escrow, fees, and moderation rules apply correctly.',
    ],
  },
  {
    title: 'Fees by task stage',
    body: [
      'Cancellation fees depend on how far the task has progressed. Amounts are calculated from the task budget and current platform fee rules.',
    ],
    list: [
      'Before an offer is accepted (open / draft): typically no cancellation fee.',
      'After an offer is accepted (assigned / funded): a cancellation fee may apply (for example, a percentage of the task amount).',
      'While work is in progress or pending approval: a higher cancellation fee may apply, and part of the payment may be released to the tasker as compensation.',
    ],
  },
  {
    title: 'Payments and escrow',
    body: [
      'If payment was held in escrow, funds are returned or split according to the task status at cancellation.',
      'Refunds are processed through the platform wallet and payment system — not via off-platform transfers.',
      'Any applicable cancellation fee is deducted from your next payout or wallet balance as described at checkout.',
    ],
  },
  {
    title: 'Repeated cancellations',
    body: [
      'Frequent cancellations may trigger moderation under platform rules, including temporary account suspension.',
      'Suspensions are based on the number of cancellations you initiated within a defined period (for example, more than five cancellations in 30 days may result in a 24-hour suspension).',
      'While suspended, you may be unable to post tasks, submit offers, or perform other restricted actions.',
    ],
  },
  {
    title: 'Disputes',
    body: [
      'If you disagree with a cancellation outcome or fee, open a dispute from the task or contact support before completing work off-platform.',
      'Keep all communication on tasknepal so we can review messages and payment history.',
    ],
  },
  {
    title: 'Tips to avoid fees',
    body: [
      'Confirm scope and timing before accepting an offer.',
      'Use questions on the task page to clarify details early.',
      'If plans change, cancel as early as possible — fees are lowest before assignment.',
    ],
  },
] as const;

export default function CancellationPolicyContent() {
  return (
    <article className="min-w-0">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#000d45] mb-3">
        Cancellation policy
      </h1>
      <p className="text-on-surface-variant text-sm sm:text-base md:text-lg leading-relaxed mb-8 md:mb-10">
        This policy explains what happens when a task is cancelled on tasknepal, including fees,
        escrow refunds, and account moderation. Specific amounts may vary by task and are shown
        when you cancel.
      </p>

      <div className="space-y-8 md:space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg md:text-xl font-bold text-[#000d45] mb-3">{section.title}</h2>
            <div className="space-y-3 text-on-surface-variant text-sm sm:text-base leading-relaxed">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {'list' in section && section.list && (
                <ul className="list-disc pl-5 space-y-2">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 md:mt-12 pt-6 border-t border-outline-variant text-xs sm:text-sm text-on-surface-variant">
        Last updated: May 2026. tasknepal may update this policy; continued use of the platform
        constitutes acceptance of the current version.
      </p>
    </article>
  );
}
