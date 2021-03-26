import type { IField } from "./ISuperDynamicForm";
import { DynInputField } from "./DynInputField";

interface IProps {
  field: IField;
}

export const DynFieldGroup = ({ field }: IProps) => (
  <fieldset key={field.id}>
    <h3>{field.label}</h3>
    {(field.fields || []).map(each => (
      <DynInputField key={each.id} type={field.type} field={each} />
    ))}
  </fieldset>
);
