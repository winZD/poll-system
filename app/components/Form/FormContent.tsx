export const FormContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <div className={`flex min-w-96 flex-col gap-4 p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
};
