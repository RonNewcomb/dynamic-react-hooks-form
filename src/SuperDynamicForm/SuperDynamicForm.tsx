import * as React from "react";
import { useState } from "react";
import type { IField } from "./ISuperDynamicForm";
import { DynFieldGroup, DynInputField, DynRadios } from "./SuperDynamicFields";
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
  getOptionsAt: (field: IField) => Promise<void>;
}

export const SuperDynamicForm = ({ query, endpoint, onDone }: IProps) => {
  const [fields, isLoading, serverError] = useAsync<IField[], typeof getDynamicForm>(getDynamicForm, query, endpoint);
  const [rerender, setRerender] = useState(1);
  const [overlayOn, setOverlayOn] = useState(false);
  const [current, setCurrent] = useState(fields || []);

  if (isLoading) return <Loading />;
  if (serverError) return <>{serverError.message}</>;
  if (!fields || !fields.length) return <>The form has no fields in it.</>;
  if (!current || !current.length) setCurrent(fields); // initialization after getDynamicForm return

  const utilityBelt: IUtilityBelt = {
    forceRender: () => setRerender(rerender + 1),

    captureValueAndCheckConditions: async (field: IField, newValue: string) => {
      if (field.value == newValue) return;
      field.value = newValue;
      if (!field.hasConditionalFields) return;
      setOverlayOn(true);
      const newForm = await pseudoSubmit(current).finally(() => setOverlayOn(false));
      setCurrent(newForm);
    },

    getOptionsAt: async (field: IField) => {
      if (!field.optionsDetail || !field.optionsDetail.optionsAt) return; // can't get them; bad server data
      if (field.optionsDetail.options && field.optionsDetail.options.length > 0) return; // already got them
      setOverlayOn(true);
      field.optionsDetail.options = await getOptions(field.optionsDetail.optionsAt)
        .catch(e => [])
        .finally(() => setOverlayOn(false));
      field.optionsDetail.optionsAt = undefined;
      utilityBelt.forceRender();
    },
  };

  const submitting = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setOverlayOn(true);
    const success = await submitDynamicForm(current).finally(() => setOverlayOn(false));
    if (success && onDone) onDone(current);
  };

  return (
    <Overlay if={overlayOn}>
      <form onSubmit={submitting} onClick={utilityBelt.forceRender} onChange={utilityBelt.forceRender} style={{ maxWidth: 400 }}>
        {current.map(f => renderSubfields(f, utilityBelt))}
        <hr />
        <button type="submit">Submit</button>
      </form>
    </Overlay>
  );
};

export const renderSubfields = (field: IField, utilityBelt: IUtilityBelt) => (
  <React.Fragment key={field.id}>
    <h2>{field.label}</h2>
    {(field.fields || []).map(f => (
      <React.Fragment key={f.id}>{renderLeafField(f, utilityBelt)}</React.Fragment>
    ))}
  </React.Fragment>
);

const renderLeafField = (field: IField, utilityBelt: IUtilityBelt) => {
  switch (field.type) {
    case "section":
      return <DynFieldGroup field={field} fns={utilityBelt} />;
    case "field_group":
      return <DynFieldGroup field={field} fns={utilityBelt} />;
    case "pick1":
      return <DynRadios field={field} fns={utilityBelt} />;
    case "text":
      return <DynInputField field={field} type="text" fns={utilityBelt} />;
    case "email":
      return <DynInputField field={field} type="email" fns={utilityBelt} />;
    case "number":
      return <DynInputField field={field} type="number" fns={utilityBelt} />;
    default:
      return <div>Unknown field type '${field.type}'</div>;
  }
};
