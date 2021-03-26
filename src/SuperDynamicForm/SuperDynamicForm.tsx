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

export const SuperDynamicForm = ({ query, endpoint, onDone }: IProps) => {
  const [fields, isLoading, serverError] = useAsync<IField[], typeof getDynamicForm>(getDynamicForm, query, endpoint);
  const [rerender, setRerender] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [current, setCurrent] = useState(fields || []);

  if (isLoading) return <Loading />;
  if (serverError) return <>{serverError.message}</>;
  if (!fields || !fields.length) return <>The form has no fields in it.</>;
  if (!current || !current.length) setCurrent(fields); // initialization after getDynamicForm return

  const forceRender = () => setRerender(rerender + 1);

  const checkFormConditions = async (field: IField, newValue: string) => {
    if (field.value == newValue) return;
    field.value = newValue;
    if (!field.hasConditionalFields) return;
    const newForm = await pseudoSubmit(current);
    setCurrent(newForm);
  };

  const getOptionsAt = async (field: IField) => {
    if (!field.optionsDetail || !field.optionsDetail.optionsAt) return; // can't get them; bad server data
    if (field.optionsDetail.options && field.optionsDetail.options.length > 0) return; // already got them
    field.optionsDetail.options = await getOptions(field.optionsDetail.optionsAt).catch(e => []);
    field.optionsDetail.optionsAt = undefined;
    forceRender();
  };

  const submitting = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setIsSubmitting(true);
    const success = await submitDynamicForm(current).finally(() => setIsSubmitting(false));
    if (success && onDone) onDone(current);
  };

  return (
    <Overlay if={isSubmitting}>
      <form onSubmit={submitting} onClick={forceRender} onChange={forceRender} style={{ maxWidth: 400, margin: "auto" }}>
        {current.map(renderSubfields)}
        <hr />
        <button type="submit">Submit</button>
      </form>
    </Overlay>
  );
};

export const renderSubfields = (field: IField) => (
  <React.Fragment key={field.id}>
    <h2>{field.label}</h2>
    {(field.fields || []).map(f => (
      <React.Fragment key={f.id}>{renderLeafField(f)}</React.Fragment>
    ))}
  </React.Fragment>
);

const renderLeafField = (field: IField) => {
  switch (field.type) {
    case "section":
      return <DynFieldGroup field={field} />;
    case "field_group":
      return <DynFieldGroup field={field} />;
    case "pick1":
      return <DynRadios field={field} />;
    case "text":
      return <DynInputField field={field} type="text" />;
    case "email":
      return <DynInputField field={field} type="email" />;
    case "number":
      return <DynInputField field={field} type="number" />;
    default:
      return <div>Unknown field type '${field.type}'</div>;
  }
};
