import type { IField } from "./ISuperDynamicForm";
import { renderSubfields } from "./SuperDynamicForm";

interface IProps {
  field: IField;
}

interface IDynInputFieldProps extends IProps {
  type: "text" | "email" | "tel" | "url" | "number" | "password";
}

export const DynFieldGroup = ({ field }: IProps) => (
  <fieldset key={field.id}>
    <h3>{field.label}</h3>
    {renderSubfields(field)}
  </fieldset>
);

export const DynInputField = ({ field, type }: IDynInputFieldProps) => (
  <div key={field.id}>
    <label htmlFor={field.id}>{field.label}</label>
    <input type={type || "text"} id={field.id} name={field.id} value={field.value} onChange={e => (field.value = e.target.value)} />
  </div>
);

export const DynRadios = ({ field }: IProps) => (
  <div>
    <h3>{field.label}</h3>
    {field.optionsDetail &&
      (field.optionsDetail.options || []).map(option => (
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
