import type { IField } from "./ISuperDynamicForm";

interface IProps {
  field: IField;
  type: string;
}

export const DynInputField = ({ field, type }: IProps) => (
  <div key={field.id}>
    <label htmlFor={field.id}>{field.label}</label>
    <input type={type || "text"} id={field.id} name={field.id} value={field.value} onChange={e => (field.value = e.target.value)} />
  </div>
);
