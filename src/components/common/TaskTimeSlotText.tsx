type TaskTimeSlotTextProps = {
  label: string;
  sub: string;
  className?: string;
};

/** Morning / Before 10am style display for task detail "To be done on". */
export default function TaskTimeSlotText({
  label,
  sub,
  className = '',
}: TaskTimeSlotTextProps) {
  return (
    <div className={className}>
      <p className="font-semibold text-on-surface text-xs md:text-sm">{label}</p>
      <p className="text-on-surface-variant text-xs md:text-sm">{sub}</p>
    </div>
  );
}
