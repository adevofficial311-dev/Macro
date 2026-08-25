import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-cb-text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full h-11 px-4 bg-cb-surface border rounded-lg text-sm text-white placeholder-cb-text-muted/50
            focus:outline-none focus:border-cb-yellow focus:ring-1 focus:ring-cb-yellow/20 transition-all
            ${error ? 'border-cb-red' : 'border-cb-border'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-cb-red">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
