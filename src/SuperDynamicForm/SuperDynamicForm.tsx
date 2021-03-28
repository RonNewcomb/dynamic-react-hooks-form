import { useState, useMemo, useCallback } from "react";
import { findField, IField, IOption } from "./ISuperDynamicForm";
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
  fetchOptions: (field: IField) => Promise<IOption[]>;
  onSubmit: (ev: React.FormEvent<HTMLFormElement>) => Promise<any>;
}

export const SuperDynamicForm = ({ query, endpoint, onDone }: IProps) => {
  log("RENDER SuperDynamicForm");
  const [fields, response] = useAsync<IField[], typeof getDynamicForm>(getDynamicForm, query, endpoint);
  const [numPendingPromises, setNumPendingPromises] = useState(0);
  const [current, setCurrent] = useState(fields || []);
  const [serverError, setServerError] = useState(response.error);

  const [render, setRender] = useState(0);
  const forceRender = useCallback(() => setRender(x => x + 1), []);

  const optionsCache = useMemo<Record<string, Promise<IOption[]>>>(() => ({}), []);

  const fetchOptions = useCallback(
    async (field: IField): Promise<IOption[]> => {
      if (field.options && field.options.length) return field.options;
      if (!field.optionsUrl) return [];
      const url = field.optionsUrl.replaceAll(/\{[^}]+}/g, fieldId => {
        const f = findField(fieldId, current);
        return f ? f.value || "" : fieldId;
      });
      if (!optionsCache[url]) {
        //log("FETCHing options from", url);
        setNumPendingPromises(x => x + 1);
        optionsCache[url] = getOptions(url)
          .catch(setServerError)
          .then(opts => (field.options = opts || []))
          .finally(() => setNumPendingPromises(x => x - 1));
      }
      return optionsCache[url];
    },
    [current, setNumPendingPromises, setServerError, getOptions]
  );

  const captureValueAndCheckConditions = useCallback(
    async (field: IField, newValue: string) => {
      //log(field.id, "changing to", newValue);
      if (field.value == newValue) return;
      field.value = newValue;
      if (!field.hasConditionalFields) return forceRender();
      //log("FETCHing conditional fields");
      setNumPendingPromises(x => x + 1);
      return pseudoSubmit(current)
        .then(setCurrent)
        .catch(setServerError)
        .finally(() => setNumPendingPromises(x => x - 1));
    },
    [current, setNumPendingPromises, setServerError, setCurrent, forceRender, pseudoSubmit]
  );

  const onSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      setNumPendingPromises(x => x + 1);
      return submitDynamicForm(current)
        .then(_ => (onDone ? onDone(current) : setServerError({ message: "Success!" } as Error)))
        .catch(setServerError)
        .finally(() => setNumPendingPromises(x => x - 1));
    },
    [current, setNumPendingPromises, setServerError, onDone, submitDynamicForm]
  );

  const utilityBelt: IUtilityBelt = { captureValueAndCheckConditions, fetchOptions, onSubmit, forceRender };

  if (response.isLoading) return log("/RENDER (loading)") && <Loading />;
  if (response.error) return log("/RENDER (initial load error)") && <>{response.error.message}</>;
  if (!fields || !fields.length) return log("/RENDER (no fields)") && <>The form has no fields in it.</>;
  if (!current || !current.length) setCurrent(fields); // initialization after useAsync(getDynamicForm) returns

  return (
    <Overlay if={numPendingPromises !== 0}>
      <form onSubmit={onSubmit} className="superDynamicForm">
        {renderFields(current, utilityBelt)}
        {serverError && <div>{serverError.message}</div>}
        <div className="dynSubmitRow">
          <button type="submit">Submit</button>
        </div>
      </form>
      {log("/RENDER")}
    </Overlay>
  );
};

function log(...args: any[]): true {
  console.log(...args);
  return true;
}
