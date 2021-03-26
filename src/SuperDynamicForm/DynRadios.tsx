import type { IField } from "./ISuperDynamicForm";

interface IProps {
  field: IField;
}

export const DynRadios = ({ field }: IProps) => (
  <div>
    <h3>{field.label}</h3>
    {(field.options || []).map(option => (
      <label htmlFor={field.id + option.value} key={option.value}>
        <input
          type="radio"
          id={field.id + option.value}
          name={field.id}
          value={option.value}
          checked={field.value === option.value}
          onChange={e => (field.value = e.target.value)}
        />
        {option.label}
      </label>
    ))}
  </div>
);
