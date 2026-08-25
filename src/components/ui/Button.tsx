import React, { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
  onClick?: any;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button({ 
  children, 
  variant = 'secondary', 
  fullWidth,
  className = '',
  ...props 
}: ButtonProps) {
  
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors rounded-lg h-11 px-6 text-sm";
  const widthClass = fullWidth ? "w-full" : "";
  
  let variantClasses = "";
  if (variant === 'primary') {
    variantClasses = "bg-cb-yellow text-black hover:bg-cb-yellow-hover shadow-sm";
  } else if (variant === 'secondary') {
    variantClasses = "bg-cb-surface text-white hover:bg-cb-surface-hover border border-cb-border shadow-sm";
  } else if (variant === 'outline') {
    variantClasses = "bg-transparent text-white border border-cb-border hover:bg-cb-surface";
  } else if (variant === 'ghost') {
    variantClasses = "bg-transparent text-cb-text-muted hover:text-white hover:bg-cb-surface";
  } else if (variant === 'danger') {
    variantClasses = "bg-cb-red text-white hover:bg-cb-red-hover shadow-sm";
  }

  const finalClasses = `${baseClasses} ${widthClass} ${variantClasses} disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  return (
    <button className={finalClasses} {...props}>
      {children}
    </button>
  );
}
