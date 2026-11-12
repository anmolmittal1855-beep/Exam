import React, { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-main)] dark:bg-[var(--color-dark-surface-elevated)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]" strokeWidth={1.5} />
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] text-center max-w-[280px] mb-4">{description}</p>
      {action}
    </div>
  );
}
