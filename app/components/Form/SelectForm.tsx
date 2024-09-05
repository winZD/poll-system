import { useFormContext } from 'react-hook-form';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  data: Array<{ value: any; label: string }>;
}

const SelectField: React.FC<SelectProps> = ({ label, name, data }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="relative flex items-center justify-between gap-2">
      <label className="flex-1" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        className="flex-1 rounded border-slate-200"
        {...register(name)}
      >
        {data.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <div className="absolute bottom-0 right-2 top-0 flex items-center text-xs text-red-500">
          {errors[name]?.message?.toString()}
        </div>
      )}
    </div>
  );
};

export default SelectField;
