import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  className = '',
  onClick,
  children,
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`rounded border border-slate-300 bg-slate-200 px-4 py-1 hover:bg-slate-300 ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};
