import { useController, useFormContext } from 'react-hook-form';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  data: Array<{ value: any; label: string }>;
}

const SelectField: React.FC<SelectProps> = ({ label, name, data }) => {
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
      <label className="flex-1" htmlFor={name}>
        {label}
      </label>
      <select id={name} className="flex-1 rounded border-slate-200" {...field}>
        {data.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="absolute bottom-0 right-2 top-0 flex items-center text-xs text-red-500">
          {error?.message?.toString()}
        </div>
      )}
    </div>
  );
};

export default SelectField;
