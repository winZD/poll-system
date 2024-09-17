import React from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      type={type}
      className={twMerge(
        'rounded border border-slate-300 bg-slate-200 px-4 py-1 hover:bg-slate-300',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
