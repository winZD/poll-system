import React, { useEffect, useRef } from 'react';
import { FieldPath, FieldValues, FormProvider } from 'react-hook-form';
import { Form } from '@remix-run/react';
type FormMethods<TFieldValues extends FieldValues = any, TContext = any> = {
  /**
   * Pass the return value of react-hook-form useForm or usePersistedForm  hooks
   */
  formMethods: any;

  /**
   * Called when any of the form field values is changed
   * @summary
   * Passed callback should be stable reference as changes to the initially passed callback value will be ignored
   * @param props
   * @returns
   */
  onValueChange?: (props: {
    name: FieldPath<TFieldValues>;
    value: any;
    values: Partial<TFieldValues>;
  }) => void;
};

type Props<TData extends FieldValues = any> = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
> &
  FormMethods<TData>;

export const HookForm = <TData extends FieldValues = any>(
  props: Props<TData>,
) => {
  const { formMethods, ...formProps } = props;
  const { className, onValueChange, ...rest } = formProps;
  const { formState, watch } = formMethods;
  const isDirty = formState?.isDirty;
  const valueChangeRef = useRef(props.onValueChange);
  const errors = formState.errors;
  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (!type || !name) return;
      if (!valueChangeRef.current) return;
      valueChangeRef.current({
        name,
        value: values[name],
        values: values as any,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);

  return (
    <FormProvider {...props.formMethods}>
      <Form
        onSubmit={props.onSubmit}
        method="POST"
        autoComplete="new-password"
        autoCorrect="off"
        className={`relative flex flex-col overflow-x-hidden ${
          className || ''
        }`}
      >
        {formProps.children}
      </Form>
    </FormProvider>
  );
};
