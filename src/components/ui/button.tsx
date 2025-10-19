// src/components/ui/button.tsx
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-space-deep',
  {
    variants: {
      variant: {
        default: 'bg-electric-blue text-space-deep shadow-neon-glow hover:bg-white',
      },
      size: {
        default: 'h-10 px-6 py-2',
        lg: 'h-12 rounded-xl px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };