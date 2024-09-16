import React, { InputHTMLAttributes } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { useController, useFormContext } from 'react-hook-form';
import { hr } from 'date-fns/locale/hr';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

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

  const [hours, setHours] = React.useState(format(field.value, 'HH'));
  const [minutes, setMinutes] = React.useState(format(field.value, 'mm'));

  return (
    <div className="relative flex flex-col justify-between">
      <label className="" htmlFor={name}>
        {`Datum i vrijeme kraja ankete`}
      </label>
      <DatePicker
        readOnly={rest.readOnly}
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
      <div className="absolute bottom-0 right-12 flex items-center gap-1">
        <input
          readOnly={rest.readOnly}
          type="text"
          className="w-12 rounded border border-slate-200 outline-none"
          value={hours}
          onChange={(e) => {
            const value = Math.min(+e.target.value, 23);
            setHours(value.toString().padStart(2, '0'));
            formMethods.setValue(name, new Date(field.value).setHours(value));
          }}
          placeholder="HH"
          maxLength={3}
        />
        <div>:</div>
        <input
          readOnly={rest.readOnly}
          type="text"
          className="w-12 rounded border border-slate-200 outline-none"
          value={minutes}
          onChange={(e) => {
            const value = Math.min(+e.target.value, 59);
            setMinutes(value.toString().padStart(2, '0'));
            formMethods.setValue(name, new Date(field.value).setMinutes(value));
          }}
          placeholder="mm"
          maxLength={3}
        />
      </div>

      {error && (
        <div className="absolute bottom-0 right-2 top-0 flex items-center text-xs text-red-500">
          {error?.message?.toString()}
        </div>
      )}
    </div>
  );
};
