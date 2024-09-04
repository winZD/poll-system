import React from 'react';
import { useFormContext } from 'react-hook-form';

interface InputProps {
  label: string;
  name: string;
  type?: string;
}

const InputField: React.FC<InputProps> = ({ label, name, type = 'text' }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="relative flex items-center justify-between gap-2">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        autoComplete="off"
        className="rounded border-slate-200 outline-none"
        type={type}
        {...register(name)}
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
