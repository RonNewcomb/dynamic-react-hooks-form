import type { IField } from "./ISuperDynamicForm";

interface IProps {
  field: IField;
  fieldChanged: (id: string, value: string) => void;
  type: string;
  value: string;
}

export const DynInputField = ({ field, fieldChanged, type, value }: IProps) => {
  return (
    <div key={field.id}>
      <label htmlFor={field.id}>{field.label}</label>
      <input
        type={type}
        id={field.id}
        name={field.id}
        value={value}
        onChange={e => fieldChanged(field.id, e.target.value)} // Notify the main state list of the new value
      />
    </div>
  );
};
