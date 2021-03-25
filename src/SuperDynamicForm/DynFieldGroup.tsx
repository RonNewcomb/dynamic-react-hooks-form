import type { IField } from "./ISuperDynamicForm";
import { DynInputField } from "./DynInputField";

interface IProps {
  field: IField;
  fieldChanged: (id: string, value: string) => void;
  values: Record<string, string>;
}

export const DynFieldGroup = ({ field, fieldChanged, values }: IProps) => {
  const fields = field.fields || [];

  return (
    <fieldset key={field.id}>
      <h3>{field.label}</h3>
      {fields.map(each => (
        <DynInputField key={each.id} type={field.type} field={each} fieldChanged={fieldChanged} value={values[each.id]} />
      ))}
    </fieldset>
  );
};
