import { useState, useMemo, useCallback, useEffect } from "react";
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
  fetchOptions: (field: IField) => Promise<IOption[]>;
  onSubmit: (ev: React.FormEvent<HTMLFormElement>) => Promise<any>;
}

export const SuperDynamicForm = ({ query, endpoint, onDone }: IProps) => {
  console.log("RENDER SuperDynamicForm");
  const [numPendingPromises, setNumPendingPromises] = useState(1);
  const [fields, response] = useAsync<IField[], typeof getDynamicForm>(getDynamicForm, query, endpoint);
  useEffect(() => response.promise.then(_ => setNumPendingPromises(x => x - 1)) && undefined, []);
  const [current, setCurrent] = useState(fields || []);
  const [serverError, setServerError] = useState(response.error);

  const [render, setRender] = useState(0);
  const forceRender = useCallback(() => setRender(x => x + 1), []);

  const optionsCache = useMemo<Record<string, Promise<IOption[]>>>(() => ({}), []);

  const fetchOptions = useCallback(
    async (field: IField): Promise<IOption[]> => {
      if (!field || !field.optionsUrl) return []; // can't get them; bad server data
      if (field.options && field.options.length > 0) return field.options; // already got them
      const url = field.optionsUrl;
      if (!optionsCache[url]) {
        console.log("FETCHing options from", url);
        setNumPendingPromises(x => x + 1);
        optionsCache[url] = getOptions(url)
          .catch(setServerError)
          .then(opts => (field.options = opts || []))
          .finally(() => setNumPendingPromises(x => x - 1));
      }
      return optionsCache[url];
    },
    [setNumPendingPromises, setServerError, getOptions]
  );

  const captureValueAndCheckConditions = useCallback(
    async (field: IField, newValue: string) => {
      console.log(field.id, "changing to", newValue);
      if (field.value == newValue) return;
      field.value = newValue;
      if (!field.hasConditionalFields) return forceRender();
      console.log("FETCHing conditional fields");
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

  const utilityBelt = useMemo<IUtilityBelt>(() => ({ captureValueAndCheckConditions, fetchOptions: fetchOptions, onSubmit, forceRender }), [
    captureValueAndCheckConditions,
    fetchOptions,
    onSubmit,
    forceRender,
  ]);

  //if (response.isLoading) return <Loading />;
  if (response.error) return <>{response.error.message}</>;
  if (!response.isLoading && (!fields || !fields.length)) return <>The form has no fields in it.</>;
  if (fields && (!current || !current.length)) setCurrent(fields); // initialization after useAsync(getDynamicForm) returns

  return (
    <Overlay if={numPendingPromises !== 0}>
      <form onSubmit={onSubmit} className="superDynamicForm">
        {renderFields(current, utilityBelt)}
        {serverError && <div>{serverError.message}</div>}
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
      {console.log("/RENDER")}
    </Overlay>
  );
};
