import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { ButtonVariant, getButtonClasses } from '@/shared/ui/button-styles';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(getButtonClasses(variant), className)}
      {...props}
    />
  );
});
