import * as React from "react";
import type { IField } from "./ISuperDynamicForm";

interface IProps {
  field: IField;
  fieldChanged: (id: string, value: string) => void;
  type?: string;
  value: string;
}

export const Field = ({ field, fieldChanged, type, value }: IProps) => {
  return (
    <div key={field._uid}>
      <label htmlFor={field._uid}>{field.label}</label>
      <input
        type={type || field.component}
        id={field._uid}
        name={field._uid}
        value={value}
        onChange={e => {
          // Notify the main state list of the new value
          fieldChanged(field._uid, e.target.value);
        }}
      />
    </div>
  );
};
