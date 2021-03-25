import * as React from "react";
import { useState, useEffect } from "react";
import type { IField, ISection } from "./ISuperDynamicForm";
import { DynFieldGroup } from "./DynFieldGroup";
import { DynInputField } from "./DynInputField";
import { DynOptions } from "./DynOptions";

const fieldMeetsCondition = (values: Record<string, string>) => (field: IField): boolean => {
  if (field.conditional && field.conditional.fieldId) {
    const segments = field.conditional.fieldId.split("_");
    const fieldId = segments[segments.length - 1];
    return values[fieldId] === field.conditional.value;
  }
  return true;
};

interface IProps {
  formData: ISection[];
}

export const SuperDynamicForm = ({ formData }: IProps) => {
  const [page, setPage] = useState(0); // state to track the current page ID of the form
  const [currentPageData, setCurrentPageData] = useState(formData[page]); // state to track the current form data that will be displayed
  const [values, setValues] = useState({} as Record<string, string>); // track the values of the form fields

  // this effect will run when the `page` changes
  useEffect(() => {
    const upcomingPageData = formData[page];
    setCurrentPageData(upcomingPageData);
    setValues(currentValues => {
      const newValues = upcomingPageData.fields.reduce((obj, field) => {
        if (field.type === "field_group") {
          for (const subField of field.fields || []) {
            obj[subField.id] = "";
          }
        } else {
          obj[field.id] = "";
        }

        return obj;
      }, {} as Record<string, string>);

      return Object.assign({}, newValues, currentValues);
    });
  }, [page, formData]);

  // callback provided to components to update the main list of form values
  const fieldChanged = (fieldId: string, value: string) => {
    // use a callback to find the field in the value list and update it
    setValues(currentValues => {
      currentValues[fieldId] = value;
      return currentValues;
    });
    setCurrentPageData(currentPageData => Object.assign({}, currentPageData)); //  force re-render
  };

  const navigatePages = (direction: string) => () => {
    const findNextPage = (page: number): number => {
      const upcomingPageData = formData[page];
      if (upcomingPageData.conditional && upcomingPageData.conditional.fieldId) {
        // we're going to a conditional page, make sure it's the right one
        const segments = upcomingPageData.conditional.fieldId.split("_");
        const fieldId = segments[segments.length - 1];
        const fieldToMatchValue = values[fieldId];
        if (fieldToMatchValue !== upcomingPageData.conditional.value) {
          return findNextPage(direction === "next" ? page + 1 : page - 1); // if we didn't find a match, try the next page
        }
      }
      // all tests for the page we want to go to pass, so go to it
      return page;
    };

    setPage(findNextPage(direction === "next" ? page + 1 : page - 1));
  };

  const nextPage = navigatePages("next");
  const prevPage = navigatePages("prev");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // todo - send data somewhere
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>{currentPageData.label}</h2>
      {currentPageData.fields.filter(fieldMeetsCondition(values)).map(field => {
        switch (field.type) {
          case "section":
          case "field_group":
            return <DynFieldGroup key={field.id} field={field} fieldChanged={fieldChanged} values={values} />;
          case "pick1":
            return <DynOptions key={field.id} field={field} fieldChanged={fieldChanged} value={values[field.id]} />;
          case "text":
            return <DynInputField key={field.id} type="text" field={field} fieldChanged={fieldChanged} value={values[field.id]} />;
          case "email":
            return <DynInputField key={field.id} type="email" field={field} fieldChanged={fieldChanged} value={values[field.id]} />;
          case "number":
            return <DynInputField key={field.id} type="number" field={field} fieldChanged={fieldChanged} value={values[field.id]} />;
          default:
            return <div>Unknown field type '${field.type}'</div>;
        }
      })}
      {page > 0 && <button onClick={prevPage}>Back</button>}&nbsp;
      {page < formData.length - 1 && <button onClick={nextPage}>Next</button>}
      <hr />
      <button onClick={() => console.log(values)}>Dump form data</button>
    </form>
  );
};
