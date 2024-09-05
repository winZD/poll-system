import React, { InputHTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

const InputField: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  className = '',
  autoComplete = 'off',
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="relative flex items-center justify-between gap-2">
      <label className="flex-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        autoComplete={autoComplete}
        className={`flex-1 rounded border-slate-200 outline-none ${className}`}
        type={type}
        {...register(name)}
        {...rest}
      />
      {errors[name] && (
        <div className="absolute bottom-0 right-2 top-0 flex items-center text-xs text-red-500">
          {errors[name]?.message?.toString()}
        </div>
      )}
    </div>
  );
};

export default InputField;
