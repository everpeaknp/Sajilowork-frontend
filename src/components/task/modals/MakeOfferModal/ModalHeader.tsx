export default function ModalHeader({
  listingKind = 'task',
}: {
  listingKind?: 'task' | 'project' | 'job' | 'service';
}) {
  const title =
    listingKind === 'project'
      ? 'Before you submit a proposal'
      : listingKind === 'job'
        ? 'Before you apply for this job'
        : listingKind === 'service'
          ? 'Before you purchase'
          : 'Before you make an offer';

  return (
    <div className="mb-8">
      <h2 id="make-offer-modal-title" className="text-4xl font-bold text-brand-dark mb-3">
        {title}
      </h2>
      <p className="text-on-surface-variant text-base">
        Help us keep sajilowork safe and fun, and fill in a few details.
      </p>
    </div>
  );
}
