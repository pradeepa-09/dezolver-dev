import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 shadow-sm',
        secondary:
          'bg-secondary text-secondary-foreground border border-border/80',
        destructive:
          'bg-rose-950/80 text-rose-300 border border-rose-800/60',
        success:
          'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60',
        warning:
          'bg-amber-950/80 text-amber-300 border border-amber-800/60',
        outline:
          'border border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
