import { IField, IOption, IUtilityBelt, renderFields, configureEnumsToElements } from "./SuperDynamicForm";
import { useAsync } from "../util/useAsync";
import { Err } from "../util/Err";

/** allowed values of IField.type */
export type SuperDynamicFormFieldTypes = "section" | "field_group" | "pick1" | "text" | "email" | "number" | "separator" | "submit";

/** mapping of IField.type to a component */
configureEnumsToElements({
  section: (field, utilityBelt) => <DynGroup field={field} fns={utilityBelt} />,
  field_group: (field, utilityBelt) => <DynFieldSet field={field} fns={utilityBelt} />,
  pick1: (field, utilityBelt) => <DynRadioset field={field} fns={utilityBelt} />,
  separator: (field, utilityBelt) => <hr className="dynSeparator dynField" />,
  text: (field, utilityBelt) => <DynInputField field={field} fns={utilityBelt} type="text" />,
  email: (field, utilityBelt) => <DynInputField field={field} fns={utilityBelt} type="email" />,
  number: (field, utilityBelt) => <DynInputField field={field} fns={utilityBelt} type="number" />,
  submit: (field, utilityBelt) => <DynSubmitRow field={field} fns={utilityBelt} />,
});

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
            <label htmlFor={uniqueId} key={uniqueId}>
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
      {response.error && <Err>{response.error.message}</Err>}
    </div>
  );
};

export const DynSubmitRow = ({ field, fns }: IProps) => (
  <div className="dynSubmitRow dynField">
    {!field.options || !field.options.length ? (
      <button type="submit">{field.label}</button>
    ) : (
      field.options.map(option => {
        const optionValue = option.value ?? option.label; // because .value is optional
        const uniqueId = field.id + optionValue;
        return (
          <button
            type="submit"
            key={uniqueId}
            id={uniqueId}
            name={field.id}
            value={optionValue}
            onClick={_ => fns.captureValueAndCheckConditions(field, optionValue)}
          >
            {option.label}
          </button>
        );
      })
    )}
  </div>
);
