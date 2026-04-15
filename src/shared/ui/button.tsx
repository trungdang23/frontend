import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { ButtonVariant, getButtonClasses } from '@/shared/ui/button-styles';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(getButtonClasses(variant), className)}
      {...props}
    />
  );
}
