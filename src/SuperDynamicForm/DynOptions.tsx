import type { IField } from "./ISuperDynamicForm";

interface IProps {
  field: IField;
  fieldChanged: (id: string, value: string) => void;
  type?: string;
  value: string;
}

export const DynOptions = ({ field, fieldChanged, value }: IProps) => (
  <div>
    <h3>{field.label}</h3>
    {(field.options || []).map(option => (
      <label htmlFor={option.value} key={option.value}>
        <input
          type="radio"
          id={option.value}
          name={field.id}
          value={option.value}
          checked={value === option.value}
          onChange={e => fieldChanged(field.id, e.target.value)}
        />
        {option.label}
      </label>
    ))}
  </div>
);
