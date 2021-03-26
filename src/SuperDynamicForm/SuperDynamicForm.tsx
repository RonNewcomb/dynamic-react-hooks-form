import * as React from "react";
import { useState } from "react";
import type { IField } from "./ISuperDynamicForm";
import { DynFieldGroup } from "./DynFieldGroup";
import { DynInputField } from "./DynInputField";
import { DynRadios } from "./DynRadios";
import { useAsync } from "../util/useAsync";
import { Loading } from "../util/Loading";
import { getDynamicForm, getOptions, pseudoSubmit, submitDynamicForm } from "../backend/api";

interface IProps {
  query: string;
  endpoint: string;
}

export const SuperDynamicForm = ({ query, endpoint }: IProps) => {
  const [fields, isLoading, serverError] = useAsync<IField[], typeof getDynamicForm>(getDynamicForm, query, endpoint);
  const [rerender, setRerender] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <Loading />;
  if (serverError) return <>{serverError.message}</>;
  if (!fields || !fields.length) return <>The form has no fields in it.</>;

  const reRender = () => setRerender(rerender + 1);
  const submitting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await submitDynamicForm(fields).catch(e => false);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={submitting} onClick={reRender} onChange={reRender}>
      {fields.map(renderSubfields)}
      <hr />
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
};

export const renderSubfields = (field: IField) => (
  <React.Fragment key={field.id}>
    <h2>{field.label}</h2>
    {(field.fields || []).map(field => (
      <React.Fragment key={field.id}>{renderLeafField(field)}</React.Fragment>
    ))}
  </React.Fragment>
);

const renderLeafField = (field: IField) => {
  if (!field || !field.type) throw Error("null field");
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
