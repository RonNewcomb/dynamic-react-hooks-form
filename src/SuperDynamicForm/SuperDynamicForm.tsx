import { useState, useMemo, useCallback, useEffect } from "react";
import { findField, IField, IOption } from "./ISuperDynamicForm";
import { renderFields, DynSubmitRow } from "./SuperDynamicFields";
import { Err } from "../util/Err";

interface IProps {
  formFields: IField[];
  getOptions: (url: string) => Promise<IOption[]>;
  postForm: (form: IField[]) => Promise<IField[]>;
  onSubmit: (form: IField[]) => Promise<string[]>;
  onLoading?: (isLoading: boolean) => void;
}

export interface IUtilityBelt {
  forceRender: () => void;
  captureValueAndCheckConditions: (field: IField, newValue: string) => Promise<void>;
  fetchOptions: (field: IField) => Promise<IOption[]>;
  submit: (ev: React.FormEvent<HTMLFormElement>) => Promise<any>;
}

export const SuperDynamicForm = ({ formFields, getOptions, postForm, onSubmit, onLoading }: IProps) => {
  log("RENDER SuperDynamicForm");
  const [numPendingPromises, setNumPendingPromises] = useState(0 /* excludes useAsync's promise */);
  const [theForm, setTheForm] = useState(formFields);
  const [formErrors, setFormErrors] = useState<undefined | Error | string | (string | Error)[]>();

  const [render, setRender] = useState(0);
  const forceRender = useCallback(() => setRender(x => x + 1), []);

  useEffect(() => onLoading && onLoading(numPendingPromises > 0), [numPendingPromises > 0]);

  const optionsCache = useMemo<Record<string, Promise<IOption[]>>>(() => ({}), []);

  const fetchOptions = useCallback(
    async (field: IField): Promise<IOption[]> => {
      if (field.options && field.options.length) return field.options;
      if (!field.optionsUrl) return [];
      const url = field.optionsUrl.replaceAll(/\{[^}]+}/g, fieldId => {
        const f = findField(fieldId.replaceAll(/}|{/g, ""), theForm);
        return f ? f.value ?? "" : fieldId; // finding the field with a blank value !== not finding the field at all; maybe {hiMom} wasn't supposed to be a fieldId
      });
      if (!optionsCache[url]) {
        setNumPendingPromises(x => x + 1);
        optionsCache[url] = getOptions(url)
          .catch(e => {
            setFormErrors(e);
            delete optionsCache[url]; // delete the rejected promise from the cache so we can re-try later
          })
          .then(opts => (field.options = opts || []))
          .finally(() => setNumPendingPromises(x => x - 1));
      }
      return optionsCache[url];
    },
    [theForm, getOptions]
  );

  const captureValueAndCheckConditions = useCallback(
    async (field: IField, newValue: string) => {
      if (field.value == newValue) return; // loose == because little point re-rendering 5 vs "5"
      field.value = newValue;
      if (!field.hasConditionalFields) return forceRender();
      setNumPendingPromises(x => x + 1);
      return postForm(theForm)
        .then(setTheForm)
        .catch(setFormErrors)
        .finally(() => setNumPendingPromises(x => x - 1));
    },
    [theForm, postForm, forceRender]
  );

  const submit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      setNumPendingPromises(x => x + 1);
      return onSubmit(theForm)
        .then(result => (result && result.length ? setFormErrors(result) : setFormErrors(undefined)))
        .catch(setFormErrors)
        .finally(() => setNumPendingPromises(x => x - 1));
    },
    [theForm, onSubmit]
  );

  const utilityBelt: IUtilityBelt = { captureValueAndCheckConditions, fetchOptions, submit, forceRender };

  if (!formFields || !formFields.length) return <Err>The form has no fields in it.</Err>;
  if (!theForm || !theForm.length) setTheForm(formFields); // initialization after useAsync(getDynamicForm) returns

  return (
    <form onSubmit={submit} className="superDynamicForm">
      {renderFields(theForm, utilityBelt)}
      {formErrors && <Err errors={formErrors} />}
      {!theForm.find(f => f.type === "submit") && <DynSubmitRow field={{ label: "Submit" } as IField} fns={utilityBelt} />}
      {log("/RENDER")}
    </form>
  );
};

function log(...args: any[]): true {
  console.log(...args);
  return true;
}
