import React, { InputHTMLAttributes } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { useController, useFormContext } from 'react-hook-form';
import { hr } from 'date-fns/locale/hr';
import { format } from 'date-fns';

registerLocale('hr', hr);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export const FormDate: React.FC<InputProps> = ({
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

  const [time, setTime] = React.useState(format(field.value, 'HH:mm'));

  const handleTimeChange = (e) => {
    let value = e.target.value;

    console.log({ value });

    const hours = Math.min(23, +value.split(':')?.[0] || 0);
    const minutes = Math.min(59, +value.split(':')?.[1] || 0);

    setTime(`${hours}:${minutes}`);

    formMethods.setValue(
      name,
      new Date(field.value).setHours(hours, minutes, 0, 0),
    );
  };

  return (
    <div className="relative flex flex-col justify-between">
      <label className="" htmlFor={name}>
        {`Datum i vrijeme kraja ankete ${new Date(field.value).toISOString()}`}
      </label>
      <DatePicker
        className="rounded border-slate-200 outline-none"
        id={name}
        ref={field.ref}
        name={field.name}
        disabled={field.disabled}
        selected={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        dateFormat="dd.MM.yyyy"
        locale={'hr'}
        // showTimeInput}
      />
      <input
        type="text"
        className="absolute bottom-0 right-16 w-20 rounded border border-slate-200 outline-none"
        value={format(field.value, 'HH:mm')}
        // value={time}
        onChange={handleTimeChange}
        placeholder="HH:mm"
        maxLength={5}
      />

      {error && (
        <div className="absolute bottom-0 right-2 top-0 flex items-center text-xs text-red-500">
          {error?.message?.toString()}
        </div>
      )}
    </div>
  );
};
