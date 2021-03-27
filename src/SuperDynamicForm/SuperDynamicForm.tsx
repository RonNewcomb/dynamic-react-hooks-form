import { useState, useMemo, useCallback } from "react";
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
  onSubmit: (ev: React.FormEvent<HTMLFormElement>) => Promise<any>;
}

export const SuperDynamicForm = ({ query, endpoint, onDone }: IProps) => {
  console.log("RENDER SuperDynamicForm");
  const [fields, isLoading, fieldGetError] = useAsync<IField[], typeof getDynamicForm>(getDynamicForm, query, endpoint);
  const [numPendingPromises, setNumPendingPromises] = useState(0); // excludes the useAsync promise
  const [current, setCurrent] = useState(fields || []);
  const [serverError, setServerError] = useState(fieldGetError);
  const [render, setRender] = useState(0);

  const forceRender = useCallback(() => setRender(x => x + 1), []);

  const optionsCache = useMemo<Record<string, Promise<IOption[]>>>(() => ({}), []);

  const getOptionsAt = useCallback(
    async (field: IField): Promise<IOption[]> => {
      if (!field.optionsDetail || !field.optionsDetail.optionsAt) return []; // can't get them; bad server data
      if (field.optionsDetail.options && field.optionsDetail.options.length > 0) return field.optionsDetail.options; // already got them
      const url = field.optionsDetail.optionsAt;
      if (!optionsCache[url]) {
        console.log("FETCHing optionsAt", url);
        setNumPendingPromises(x => x + 1);
        optionsCache[url] = getOptions(url)
          .catch(setServerError)
          .then(opts => (field.optionsDetail!.options = opts || []))
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

  const utilityBelt = useMemo(() => ({ captureValueAndCheckConditions, getOptionsAt, onSubmit } as IUtilityBelt), [
    captureValueAndCheckConditions,
    getOptionsAt,
    onSubmit,
    forceRender,
  ]);

  if (isLoading) return <Loading />;
  if (fieldGetError) return <>{fieldGetError.message}</>;
  if (!fields || !fields.length) return <>The form has no fields in it.</>;
  if (!current || !current.length) setCurrent(fields); // initialization after useAsync(getDynamicForm) returns

  return (
    <Overlay if={numPendingPromises !== 0}>
      <form onSubmit={onSubmit} style={{ maxWidth: 400, margin: "auto" }}>
        {renderFields(current, utilityBelt)}
        <hr />
        {serverError && <div>{serverError.message}</div>}
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
      {console.log("/RENDER")}
    </Overlay>
  );
};
