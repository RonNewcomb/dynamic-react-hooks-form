import * as React from "react";
import { useAsync } from "../util/useAsync";
import type { IField, IOption } from "./ISuperDynamicForm";
import type { IUtilityBelt } from "./SuperDynamicForm";

export const renderFields = (fields: IField[], fns: IUtilityBelt) =>
  fields.map(field => <React.Fragment key={field.id}>{renderField(field, fns)}</React.Fragment>);

export const renderField = (field: IField, utilityBelt: IUtilityBelt) => {
  switch (field.type) {
    case "section":
      return <DynFieldGroup field={field} fns={utilityBelt} />;
    case "field_group":
      return <DynFieldGroup field={field} fns={utilityBelt} />;
    case "pick1":
      return <DynRadioset field={field} fns={utilityBelt} />;
    case "text":
      return <DynInputField field={field} fns={utilityBelt} type="text" />;
    case "email":
      return <DynInputField field={field} fns={utilityBelt} type="email" />;
    case "number":
      return <DynInputField field={field} fns={utilityBelt} type="number" />;
    default:
      return <div>Unknown field type '${field.type}'</div>;
  }
};

interface IProps {
  field: IField;
  fns: IUtilityBelt;
}

interface IDynInputFieldProps extends IProps {
  type: "text" | "email" | "tel" | "url" | "number" | "password";
}

export const DynFieldGroup = ({ field, fns }: IProps) => (
  <fieldset>
    <h3>{field.label}</h3>
    {renderFields(field.fields || [], fns)}
  </fieldset>
);

export const DynInputField = ({ field, fns, type }: IDynInputFieldProps) => (
  <div>
    <label htmlFor={field.id}>{field.label}</label>
    <input type={type || "text"} id={field.id} name={field.id} value={field.value} onChange={e => fns.captureValueAndCheckConditions(field, e.target.value)} />
  </div>
);

export const DynRadioset = ({ field, fns }: IProps) => {
  const [options, isLoading, error] = useAsync<IOption[], typeof fns.getOptionsAt>(fns.getOptionsAt, field);
  return (
    <div>
      <h3>{field.label}</h3>
      {field.optionsDetail &&
        (options || []).map(option => (
          <label htmlFor={field.id + option.value} key={option.value}>
            <input
              type="radio"
              id={field.id + option.value}
              name={field.id}
              disabled={isLoading}
              value={option.value}
              checked={field.value === option.value}
              onChange={e => fns.captureValueAndCheckConditions(field, e.target.value)}
            />
            {option.label}
          </label>
        ))}
      {error && <div>{error.message}</div>}
    </div>
  );
};
