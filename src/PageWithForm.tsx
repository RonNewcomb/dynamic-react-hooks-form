import { useCallback, useState } from "react";
import { topbarColor, textColorInverse, textColor } from "./app";
import { IField, ISuperDynamicFieldMaker } from "./SuperDynamicForm/SuperDynamicForm";
import { SuperDynamicForm } from "./SuperDynamicForm/SuperDynamicForm";
import { getDynamicForm, getOptions, pseudoSubmit, submitDynamicForm } from "./backend/api";
import { Overlay } from "./util/Overlay";
import { useAsync } from "./util/useAsync";
import { DynFieldSet, DynGroup, DynInputField, DynRadioset, DynSubmitRow } from "./SuperDynamicForm/ConfigureSuperDynamicFields";
import { Err } from "./util/Err";

const config: Record<string, ISuperDynamicFieldMaker> = {
  section: (field, utilityBelt) => <DynGroup field={field} fns={utilityBelt} />,
  field_group: (field, utilityBelt) => <DynFieldSet field={field} fns={utilityBelt} />,
  pick1: (field, utilityBelt) => <DynRadioset field={field} fns={utilityBelt} />,
  separator: (field, utilityBelt) => <hr className="dynSeparator dynField" />,
  text: (field, utilityBelt) => <DynInputField field={field} fns={utilityBelt} type="text" />,
  email: (field, utilityBelt) => <DynInputField field={field} fns={utilityBelt} type="email" />,
  number: (field, utilityBelt) => <DynInputField field={field} fns={utilityBelt} type="number" />,
  submit: (field, utilityBelt) => <DynSubmitRow field={field} fns={utilityBelt} />,
  error: (field, _) => <Err>{field.label}</Err>,
};

export const PageWithForm = () => {
  const [result, setResult] = useState<IField[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [arrayOfFormFields, response] = useAsync<IField[], typeof getDynamicForm>(getDynamicForm, "?userId=orWhatever", "http://www.example.com");

  const submitForm = useCallback(
    (form: IField[]) =>
      submitDynamicForm(form).then(r => {
        if (!r.errors || !r.errors.length) setResult(form);
        return r.errors || [];
      }),
    []
  );

  return (
    <>
      {result ? (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      ) : (
        <Overlay if={isLoading || response.isLoading}>
          <SuperDynamicForm
            formFields={arrayOfFormFields || []}
            onLoading={setIsLoading}
            getOptions={getOptions}
            postForm={pseudoSubmit}
            onSubmit={submitForm}
          />
        </Overlay>
      )}

      <style>
        {`
          .superDynamicForm {
            max-width: 400;
            margin: auto;
          }
          .superDynamicForm [newlyAdded] {
          }
          .superDynamicForm [removing] {
          }
          .dynSubmitRow {
            display: flex;
            justify-content: space-around;
          }
          .dynSubmitRow button {
            padding: 5px 10px;
            border-radius: 0.7em / 50%;
            border: 0;
            background-color: ${topbarColor};
            color: ${textColorInverse};
          }
          .dynField {
            margin: ${formFieldMarginBetween} 0;
          }
          .dynInputField > label {
            display: inline-block; /* so width works */
            width: ${formFieldLeftColumnWidth};
          }
          .dynGroup {
          }
          .dynGroup > label {
            font-weight: 800;
          }
          .dynGroup > div {
            padding: 15px;
            margin-bottom: 20px;
          }
          .DynRadioset {
            display: flex;            
          }
          .DynRadioset > label {
            display: inline-block; /* so width works */
            width: ${formFieldLeftColumnWidth};
          }
          .DynRadioset > div {
            display: flex;
            flex-direction: column;
            border-left: 1px dotted ${textColor};
          }

          .error {
            background-color: darkred;
            padding: 0.5em 1.5em;
            color: white;
          }
        `}
      </style>
    </>
  );
};
export const formFieldLeftColumnWidth = "30%";
export const formFieldMarginBetween = "8px";
