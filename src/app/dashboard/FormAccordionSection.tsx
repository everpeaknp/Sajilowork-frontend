'use client';

import type { ElementType, ReactNode } from 'react';
import DashboardAccordionItem from './DashboardAccordionItem';

type FormAccordionSectionProps = {
  title: string;
  description?: string;
  icon: ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export default function FormAccordionSection({
  title,
  description,
  icon,
  isOpen,
  onToggle,
  children,
}: FormAccordionSectionProps) {
  return (
    <DashboardAccordionItem
      title={title}
      icon={icon}
      description={description ?? title}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-5">{children}</div>
    </DashboardAccordionItem>
  );
}
