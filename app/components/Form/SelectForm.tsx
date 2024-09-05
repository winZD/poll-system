import { useFormContext } from 'react-hook-form';

interface SelectProps {
  label: string;
  name: string;
  data: Array<{ id: number; value: string }>;
}

const SelectField: React.FC<SelectProps> = ({ label, name, data }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="relative flex items-center justify-between gap-2">
      <label htmlFor={name}>{label}</label>
      <select className="rounded border-slate-200" {...register(name)}>
        {data.map((option) => (
          <option key={option.id} value={option.value}>
            {option.value}
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
