import * as React from "react";
import { useState } from "react";
import type { IField, IOption } from "./ISuperDynamicForm";
import { renderFields } from "./SuperDynamicFields";
import { getDynamicForm, getOptions, pseudoSubmit, submitDynamicForm } from "../backend/api";
import { useAsync } from "../util/useAsync";
import { Loading } from "../util/Loading";
import { Overlay } from "../util/Overlay";

interface IProps {
  query: string;
  endpoint: string;
  onDone?: (finalForm: IField[]) => any;
}

export interface IUtilityBelt {
  forceRender: () => void;
  captureValueAndCheckConditions: (field: IField, newValue: string) => Promise<void>;
  getOptionsAt: (field: IField) => Promise<IOption[]>;
}

export const SuperDynamicForm = ({ query, endpoint, onDone }: IProps) => {
  const [fields, isLoading, fieldGetError] = useAsync<IField[], typeof getDynamicForm>(getDynamicForm, query, endpoint);
  const [overlay, setOverlay] = useState(0);
  const [current, setCurrent] = useState(fields || []);
  const [serverError, setServerError] = useState(fieldGetError);

  if (isLoading) return <Loading />;
  if (fieldGetError) return <>{fieldGetError.message}</>;
  if (!fields || !fields.length) return <>The form has no fields in it.</>;
  if (!current || !current.length) setCurrent(fields); // initialization after useAsync(getDynamicForm) returns

  const utilityBelt: IUtilityBelt = {
    forceRender: () => void 0, // setRerender(rerender + 1),

    captureValueAndCheckConditions: async (field: IField, newValue: string) => {
      if (field.value == newValue) return;
      field.value = newValue;
      if (!field.hasConditionalFields) return;
      setOverlay(overlay + 1);
      return pseudoSubmit(current)
        .then(setCurrent)
        .catch(setServerError)
        .finally(() => setOverlay(overlay - 1));
    },

    getOptionsAt: async (field: IField): Promise<IOption[]> => {
      if (!field.optionsDetail || !field.optionsDetail.optionsAt) return []; // can't get them; bad server data
      if (field.optionsDetail.options && field.optionsDetail.options.length > 0) return field.optionsDetail.options; // already got them
      setOverlay(overlay + 1);
      //console.log("fetching optionsAt", field.optionsDetail.optionsAt);
      return getOptions(field.optionsDetail.optionsAt)
        .catch(setServerError)
        .then(opts => (field.optionsDetail!.options = opts || []))
        .finally(() => setOverlay(overlay - 1));
    },
  }; // end utilityBelt

  const submitting = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setOverlay(overlay + 1);
    return submitDynamicForm(current)
      .then(_ => (onDone ? onDone(current) : setServerError({ message: "Success!" } as Error)))
      .catch(setServerError)
      .finally(() => setOverlay(overlay - 1));
  };

  return (
    <Overlay if={overlay !== 0}>
      <form onSubmit={submitting} style={{ maxWidth: 400, margin: "auto" }}>
        {renderFields(current, utilityBelt)}
        <hr />
        {serverError && <div>{serverError.message}</div>}
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </Overlay>
  );
};
