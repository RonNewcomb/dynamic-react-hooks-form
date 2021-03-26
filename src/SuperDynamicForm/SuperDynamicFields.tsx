import type { IField } from "./ISuperDynamicForm";
import { IUtilityBelt, renderSubfields } from "./SuperDynamicForm";

interface IProps {
  field: IField;
  fns: IUtilityBelt;
}

interface IDynInputFieldProps extends IProps {
  type: "text" | "email" | "tel" | "url" | "number" | "password";
}

export const DynFieldGroup = ({ field, fns }: IProps) => (
  <fieldset key={field.id}>
    <h3>{field.label}</h3>
    {renderSubfields(field, fns)}
  </fieldset>
);

export const DynInputField = ({ field, type, fns }: IDynInputFieldProps) => (
  <div key={field.id}>
    <label htmlFor={field.id}>{field.label}</label>
    <input type={type || "text"} id={field.id} name={field.id} value={field.value} onChange={e => fns.captureValueAndCheckConditions(field, e.target.value)} />
  </div>
);

export const DynRadios = ({ field, fns }: IProps) => (
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
            onChange={e => fns.captureValueAndCheckConditions(field, e.target.value)}
          />
          {option.label}
        </label>
      ))}
  </div>
);
