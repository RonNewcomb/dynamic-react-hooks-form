import * as React from "react";
import { useAsync } from "../util/useAsync";
import type { IField, IOption } from "./ISuperDynamicForm";
import type { IUtilityBelt } from "./SuperDynamicForm";

export const renderFields = (fields: IField[], fns: IUtilityBelt) =>
  fields.map(field => <React.Fragment key={field.id}>{renderField(field, fns)}</React.Fragment>);

export const renderField = (field: IField, utilityBelt: IUtilityBelt) => {
  switch (field.type) {
    case "section":
      return <DynGroup field={field} fns={utilityBelt} />;
    case "field_group":
      return <DynFieldSet field={field} fns={utilityBelt} />;
    case "pick1":
      return <DynRadioset field={field} fns={utilityBelt} />;
    case "separator":
      return <hr className="dynSeparator dynField" />;
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

export const DynGroup = ({ field, fns }: IProps) => (
  <div className="dynGroup dynField">
    <label>{field.label}</label>
    <div>{renderFields(field.fields || [], fns)}</div>
  </div>
);

export const DynFieldSet = ({ field, fns }: IProps) => (
  <fieldset className="dynFieldSet dynField">
    <legend>{field.label}</legend>
    <div>{renderFields(field.fields || [], fns)}</div>
  </fieldset>
);

export const DynInputField = ({ field, fns, type }: IDynInputFieldProps) => (
  <div className="dynInputField dynField">
    <label htmlFor={field.id}>{field.label}</label>
    <input type={type || "text"} id={field.id} name={field.id} value={field.value} onChange={e => fns.captureValueAndCheckConditions(field, e.target.value)} />
  </div>
);

export const DynRadioset = ({ field, fns }: IProps) => {
  const [options, response] = useAsync<IOption[], typeof fns.fetchOptions>(fns.fetchOptions, field);
  return (
    <div className={`dynRadioset dynField ${response.isLoading ? "dynLoading" : ""}`}>
      <label>{field.label}</label>
      <div>
        {(options || []).map(option => {
          const optionValue = option.value ?? option.label; // so .value is optional
          const uniqueId = field.id + optionValue; // because option.value might be something like "yes" which is used a dozen times on the same page
          return (
            <label htmlFor={uniqueId} key={optionValue}>
              <input
                type="radio"
                id={uniqueId}
                name={field.id}
                disabled={response.isLoading}
                value={optionValue}
                checked={field.value === optionValue}
                onChange={e => fns.captureValueAndCheckConditions(field, e.target.value)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {response.error && <div>{response.error.message}</div>}
    </div>
  );
};
