import * as React from "react";
import { useState } from "react";
import type { ISection } from "./ISuperDynamicForm";
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
  const [sections, isLoading, serverError] = useAsync<ISection[], typeof getDynamicForm>(getDynamicForm, query, endpoint);
  const [rerender, setRerender] = useState(1);

  const reRender = () => setRerender(rerender + 1);

  if (isLoading) return <Loading />;
  if (serverError) return <>{serverError.message}</>;
  if (!sections || !sections.length) return <>Nothing to display</>;

  const submitting = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitDynamicForm(sections);
  };

  return (
    <form onSubmit={submitting} onClick={reRender} onChange={reRender}>
      {(sections || []).map(section => (
        <React.Fragment key={section.id}>
          <h2>{section.label}</h2>
          {section.fields.map(field => (
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
      ))}
      <hr />
      <button type="submit">Submit</button>
    </form>
  );
};
