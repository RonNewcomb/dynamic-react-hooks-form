import { IField, IOption, IUtilityBelt } from "./SuperDynamicForm";
import { useAsync } from "../util/useAsync";
import { Err } from "../util/Err";

interface IProps {
  field: IField;
  fns: IUtilityBelt;
}

interface IDynInputFieldProps extends IProps {
  type: "text" | "email" | "tel" | "url" | "number" | "password";
}

export const defaultSwitchFn = (field: IField, utilityBelt: IUtilityBelt): JSX.Element => {
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
    case "submit":
      return <DynSubmitRow field={field} fns={utilityBelt} />;
    case "error":
      return <Err>{field.label}</Err>;
    default:
      return <Err>Unknown field type '{field.type}'</Err>;
  }
};

export const DynGroup = ({ field, fns }: IProps) => (
  <div className="dynGroup dynField">
    <label>{field.label}</label>
    <div>{fns.renderFields(field.fields || [], fns)}</div>
  </div>
);

export const DynFieldSet = ({ field, fns }: IProps) => (
  <fieldset className="dynFieldSet dynField">
    <legend>{field.label}</legend>
    <div>{fns.renderFields(field.fields || [], fns)}</div>
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
