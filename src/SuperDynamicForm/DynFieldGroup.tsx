import type { IField } from "./ISuperDynamicForm";
import { renderSubfields } from "./SuperDynamicForm";

interface IProps {
  field: IField;
}

export const DynFieldGroup = ({ field }: IProps) => (
  <fieldset key={field.id}>
    <h3>{field.label}</h3>
    {renderSubfields(field)}
  </fieldset>
);
