import * as React from "react";
import { Field } from "./Field";
import { IField } from "./ISuperDynamicForm";

interface IProps {
  field: IField;
  fieldChanged: (id: string, value: string) => void;
  values: Record<string, string>;
}

export const FieldGroup = ({ field, fieldChanged, values }: IProps) => {
  const fields = field.fields || [];

  return (
    <fieldset key={field._uid}>
      <h3>{field.label}</h3>
      {fields.map(each => (
        <Field key={each._uid} field={each} fieldChanged={fieldChanged} value={values[each._uid]} />
      ))}
    </fieldset>
  );
};
