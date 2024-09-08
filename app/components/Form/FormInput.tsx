import React, { InputHTMLAttributes } from 'react';
import { useController, useFormContext } from 'react-hook-form';

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
  const formMethods = useFormContext();

  const {
    field,
    fieldState: { invalid, isTouched, isDirty, error },
    formState: { touchedFields, dirtyFields },
  } = useController({
    name,
    control: formMethods.control,
  });

  return (
    <div className="relative flex flex-col justify-between">
      <label className="" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        autoComplete={autoComplete}
        className={`rounded border-slate-200 outline-none ${className}`}
        type={type}
        {...field}
        {...rest}
      />
      {error && (
        <div className="absolute bottom-0 right-2 top-0 flex items-center text-xs text-red-500">
          {error?.message?.toString()}
        </div>
      )}
    </div>
  );
};

export default InputField;
