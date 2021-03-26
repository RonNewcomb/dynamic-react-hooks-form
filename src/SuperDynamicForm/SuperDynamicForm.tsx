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

  if (isLoading) return <Loading />;
  if (serverError) return <>{serverError.message}</>;
  if (!fields || !fields.length) return <>The form has no fields in it.</>;

  const reRender = () => setRerender(rerender + 1);
  const submitting = (event: React.FormEvent<HTMLFormElement>) => submitDynamicForm(fields);

  return (
    <form onSubmit={submitting} onClick={reRender} onChange={reRender}>
      {(fields || []).map(renderField)}
      <hr />
      <button type="submit">Submit</button>
    </form>
  );
};

const renderField = (field: IField) => (
  <React.Fragment key={field.id}>
    <h2>{field.label}</h2>
    {(field.fields || []).map(field => (
      <React.Fragment key={field.id}>
        {field.type === "section" ? (
          <DynFieldGroup field={field} />
        ) : field.type === "field_group" ? (
          <DynFieldGroup field={field} />
        ) : field.type === "pick1" ? (
          <DynRadios field={field} />
        ) : field.type === "text" ? (
          <DynInputField field={field} type="text" />
        ) : field.type === "email" ? (
          <DynInputField field={field} type="email" />
        ) : field.type === "number" ? (
          <DynInputField field={field} type="number" />
        ) : (
          <div>Unknown field type '${field.type}'</div>
        )}
      </React.Fragment>
    ))}
  </React.Fragment>
);
