const FAQ_ITEMS = [
  {
    q: 'How much does it cost to post a task?',
    a: 'Posting a task on tasknepal is free. You only pay when you accept an offer and funds are held securely until the work is completed to your satisfaction.',
  },
  {
    q: 'How do I choose the right Tasker?',
    a: 'Compare offers by price, availability, and profile details. Read ratings and reviews from other customers before assigning someone to your task.',
  },
  {
    q: 'When is payment taken?',
    a: 'Payment is secured when you accept an offer. Funds are held in escrow and released to the Tasker after you approve the completed work, similar to trusted marketplace models.',
  },
  {
    q: 'What if I need to cancel a task?',
    a: 'Either party may cancel depending on task status. Fees may apply after an offer is accepted. See our cancellation policy for full details.',
  },
  {
    q: 'How do Taskers get paid?',
    a: 'After the poster approves completion, payment is released to the Tasker through the platform wallet and supported payout methods.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'We use verification, secure payments, and platform messaging to reduce risk. Read our Privacy Policy for how we handle your data.',
  },
  {
    q: 'Can I communicate off the platform?',
    a: 'We recommend keeping all task communication on tasknepal so support can help if there is a dispute or payment issue.',
  },
  {
    q: 'How do I contact support?',
    a: 'Use the Contact Us page to email our team. Include your account email and task ID for faster help.',
  },
] as const;

export default function FaqContent() {
  return (
    <div className="min-w-0 space-y-3">
      {FAQ_ITEMS.map((item) => (
        <details
          key={item.q}
          className="group rounded-2xl border border-gray-100 bg-[#f8faff] open:bg-white open:shadow-sm"
        >
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold text-[#0b1442] marker:content-none sm:text-base [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              {item.q}
              <span className="text-[#1161fe] transition group-open:rotate-45">+</span>
            </span>
          </summary>
          <div className="border-t border-gray-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-[#6a719a] sm:text-base">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}
