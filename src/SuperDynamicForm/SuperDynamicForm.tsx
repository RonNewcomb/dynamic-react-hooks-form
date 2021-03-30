import { useState, useMemo, useCallback, useEffect, Fragment } from "react";

export interface IField {
  id: string;
  type: string;
  label: string;

  // raw value that user inputted into HTMLInputElement
  // Sent to server on submit, sent & received from server on pseudoSubmit and maybe initial load as well
  value?: string;

  // if type == 'field_group' or 'section' or other such aggregate
  fields?: IField[];

  // if type is 'pick1'
  options?: IOption[]; // if blank, .optionsUrl must have URL to get list
  optionsUrl?: string; // if blank, .options must have list

  // if true then requires pseudosubmit onChange
  hasConditionalFields?: boolean;
}

export interface IOption {
  label: string;
  value?: string; // if missing, use label as value
}

export interface IUtilityBelt {
  forceRender: () => void;
  captureValueAndCheckConditions: (field: IField, newValue: string) => Promise<void>;
  fetchOptions: (field: IField) => Promise<IOption[]>;
  submit: (ev: React.FormEvent<HTMLFormElement>) => Promise<any>;
}

export type ISuperDynamicFieldMaker = (field: IField, utilityBelt: IUtilityBelt) => JSX.Element;

let enumToElement: Record<string, ISuperDynamicFieldMaker> = {
  error: f => <div className="error">{f.label}</div>,
};

export const configureEnumsToElements = (map: Record<string, ISuperDynamicFieldMaker>) => {
  enumToElement = map;
  if (!enumToElement.error) enumToElement.error = f => <div className="error">{f.label}</div>;
};

export const errorToElement = (str: string | Error | (Error | string)[]) => {
  const array = Array.isArray(str) ? str : [str];
  const strings = array.map(e => (e instanceof Error ? e.message : e));
  const fields = strings.map(s => ({ label: s } as IField));
  return <>{renderFields(fields, undefined as any)}</>;
};

export const renderField = (field: IField, utilityBelt: IUtilityBelt): JSX.Element => {
  const makeElement = enumToElement[field.type];
  return makeElement ? (
    makeElement(field, utilityBelt)
  ) : (
    <div>Unknown field type {field.type}. Was configureEnumsToElements() called, or, props.config passed-in?</div>
  );
};

export const renderFields = (fields: IField[], utilityBelt: IUtilityBelt) =>
  fields.map((field, i) => <Fragment key={field.id || i}>{renderField(field, utilityBelt)}</Fragment>);

interface IProps {
  config?: Record<string, ISuperDynamicFieldMaker>; // or call configureEnumsToElements() once, like where ReactDOM.render() is called
  formFields: IField[];
  getOptions: (url: string) => Promise<IOption[]>;
  postForm: (form: IField[]) => Promise<IField[]>;
  onSubmit: (form: IField[]) => Promise<string[]>;
  onLoading?: (isLoading: boolean) => void;
}

export const SuperDynamicForm = ({ config, formFields, getOptions, postForm, onSubmit, onLoading }: IProps) => {
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

  if (!formFields || !formFields.length) return errorToElement("The form has no fields in it.");
  if (!theForm || !theForm.length) setTheForm(formFields); // initialization after useAsync(getDynamicForm) returns
  if (config) enumToElement = config; // in case they didn't call configureEnumsToElements() from app.tsx or wherever

  return (
    <form onSubmit={submit} className="superDynamicForm">
      {renderFields(theForm, utilityBelt)}
      {formErrors && errorToElement(formErrors)}
      {!theForm.some(f => f.type === "submit") && <button type="submit">Submit</button>}
      {log("/RENDER")}
    </form>
  );
};

// utility functions ///////////////

export function findField(fieldId: string, fields?: IField[]): IField | undefined {
  if (fields)
    for (let f of fields) {
      if (f.id === fieldId) return f;
      const result = findField(fieldId, f.fields);
      if (result) return result;
    }
  return undefined;
}

function log(...args: any[]): true {
  console.log(...args);
  return true;
}
