import { useState, useMemo, useCallback, useEffect, Fragment, SetStateAction, Dispatch } from "react";
import { useStateAsync, useUnlessUnmounted } from "../util/useAsync";

/** Only 3 properties are required for all field.type */
export interface IField {
  /** must be unique in the whole form */
  id: string;
  /** goes into the switch statement of renderField */
  type: string;
  /** shown to user */
  label: string;

  /** Raw value that user inputted into HTMLInputElement. Sent to server on submit, sent & received from server on pseudoSubmit and maybe initial load as well */
  value?: string;

  /** if type == 'field_group' or 'section' or other such aggregate */
  fields?: IField[];

  /** for dropdown or radioset types. If blank, .optionsUrl must have the URL to fetch the options */
  options?: IOption[];
  /** for dropdown or radioset types. If blank, .options must have the list already */
  optionsUrl?: string;

  /** if true then requires pseudosubmit on this element's onChange or onBlur event, to fetch the conditional fields */
  hasConditionalFields?: boolean;

  /** Validation information.  How the server sends this is highly server-specific, so SuperDynamicForm merely accepts a function which "runs all validations for this field" */
  required?: boolean;
  minLength?: number;
  minValue?: number | Date;
  maxValue?: number | Date;

  /** NOT SENT FROM SERVER. Holder for validation errors */
  validationErrors?: string[];
}

/** see IField.options */
export interface IOption {
  /** visible to user */
  label: string;
  /** if missing, label will be used as value */
  value?: string;
}

/** the Props passed to SuperDynamicForm.  */
interface IProps {
  /** the heart of any dynamic form solution is a big switch statement on a property from the server that says which component to use */
  renderField: (field: IField, utilityBelt: IUtilityBelt) => JSX.Element;
  /** function that takes a field, and the whole form, and returns validation errors */
  validate: (field: IField, form: IField[]) => string[];
  /** the array of IField objects from the server */
  formFields: IField[];
  /** your function should fetch the options array from the server from this url (or url fragment) */
  getOptions: (url: string) => Promise<IOption[]>;
  /** your function should POST (not submit) the whole form to the server, to receive the whole form back, with some fields added or removed */
  postForm: (form: IField[]) => Promise<IField[]>;
  /** your function should SUBMIT the whole form to the server, and to receive validation errors back. Empty array means success but SuperDynamicForm really has nothing to do on success. */
  onSubmit: (form: IField[]) => Promise<string[]>;
  /** callback to let parent component know when SuperDynamicForm is waiting on server data. You should probably place an overlay over the form. */
  onLoading?: (isLoading: boolean) => void;
  /** text to show on the submit button. If blank, no submit is shown, and it's assumed one of the IFields from the server will tell the renderField to render one. (Or more. Multiple submit buttons work like a set of radio buttons, with name=field.id and each value is different.) */
  submitButtonText?: string;
}

/** functions passed to each of your Field Components in the renderField.  */
export interface IUtilityBelt {
  /** forces a re-render of the whole form */
  forceRender: () => void;
  /** copies the value from the HTML Element into the model, runs validation, and asks server for conditional fields if needed */
  captureValueAndCheckConditions: (field: IField, newValue: string) => Promise<void>;
  /** get the options for a dropdown or radioset from the server. Url substitutions like {otherField.id} will be replaced with otherField.value */
  fetchOptions: (field: IField) => Promise<IOption[]>;
  /** in case the server is supplying its own submit buttons, which may even be nested deeply in .fields */
  submit: (ev: React.FormEvent<HTMLFormElement>) => Promise<any>;
  /** for IField.fields array */
  renderFields: (fields: IField[], utilityBelt: IUtilityBelt) => JSX.Element[];
  /** transforms a string or Error object to a field of type "error" with label as the string or .message */
  errorToElement: (str: undefined | string | Error | (Error | string)[]) => JSX.Element;
}

export const SuperDynamicForm = ({ formFields, renderField, validate, getOptions, postForm, onSubmit, submitButtonText, onLoading }: IProps) => {
  log("RENDER SuperDynamicForm");

  // main state (even if derived from props)
  const [theForm, setTheForm] = useState(formFields);
  const [formErrors, setFormErrors] = useState<undefined | Error | string | (string | Error)[]>();

  // track server calls & inform parent component
  let [numPendingPromises, setNumPendingPromises] = useStateAsync(0);
  useEffect(() => onLoading && onLoading(numPendingPromises > 0), [numPendingPromises > 0]);
  useEffect(() => () => (setNumPendingPromises = () => undefined) && undefined, []);

  // cache all HTTP GET server calls
  const optionsCache = useMemo<Record<string, Promise<IOption[]>>>(() => ({}), []); // url -> promise-of-results

  // necessary?
  const wrapField = useCallback(
    (field: IField, utilityBelt: IUtilityBelt) => (
      <div key={field.id} className="dynField">
        {renderField(field, utilityBelt)}
      </div>
    ),
    [renderField]
  );

  // begin creating UtilityBelt ////

  const forceRender = useCallback(() => setTheForm(fields => fields.slice()), []);

  const errorToElement = useCallback(
    (str: undefined | string | Error | (Error | string)[]): JSX.Element => {
      if (!str) return <></>;
      const array = Array.isArray(str) ? str : [str];
      const strings = array.map(e => (e instanceof Error ? e.message : e)).filter(x => !!x);
      const fields = strings.map((label, i) => ({ label, id: i.toString(), type: "error" } as IField));
      return <>{fields.map(f => renderField(f, undefined as any))}</>;
    },
    [renderField]
  );

  const renderFields = useCallback(
    (fields: IField[], utilityBelt: IUtilityBelt): JSX.Element[] => fields.map(field => <Fragment key={field.id}>{wrapField(field, utilityBelt)}</Fragment>),
    [wrapField]
  );

  const fetchOptions = useCallback(
    async (field: IField): Promise<IOption[]> => {
      if (!field.optionsUrl) return field.options || [];
      // optionsUrl trumps everything. With substitutions, a url is a set of urls so field.options isn't a valid cache.
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
    async (field: IField, newValue: string): Promise<void> => {
      if (field.value == newValue) return; // loose == because there's little point re-rendering 5 vs "5"
      field.value = newValue;
      const errs = validate(field, theForm);
      field.validationErrors = errs && errs.length ? errs : undefined; // ensure the property is only truthy if errors are present
      if (!field.hasConditionalFields) return forceRender();
      if (field.validationErrors) return forceRender(); // no point calling server when client-side validation fails
      setNumPendingPromises(x => x + 1);
      return postForm(theForm)
        .then(setTheForm)
        .catch(setFormErrors)
        .finally(() => setNumPendingPromises(x => x - 1));
    },
    [theForm, postForm, validate, forceRender]
  );

  const submit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>): Promise<void> => {
      ev.preventDefault();
      setNumPendingPromises(x => x + 1);
      return onSubmit(theForm)
        .then(setFormErrors)
        .catch(setFormErrors)
        .finally(() => setNumPendingPromises(x => x - 1));
    },
    [theForm, onSubmit]
  );

  const utilityBelt: IUtilityBelt = { captureValueAndCheckConditions, fetchOptions, submit, forceRender, renderFields, errorToElement };
  // end creating UtilityBelt ////

  if (!formFields || !formFields.length) return <div title="The form has no fields in it."></div>;
  if (!theForm || !theForm.length) setTheForm(formFields); // set derived state from props

  return (
    <form onSubmit={submit} className="superDynamicForm">
      {renderFields(theForm, utilityBelt)}
      {formErrors && errorToElement(formErrors)}
      {submitButtonText && <button type="submit">{submitButtonText}</button>}
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
