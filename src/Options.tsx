import * as React from "react";
import { Fragment } from "react";
import { IField } from "./ISuperDynamicForm";

interface IProps {
  field: IField;
  fieldChanged: (id: string, value: string) => void;
  type?: string;
  value: string;
}

export const Options = ({ field, fieldChanged, value }: IProps) => (
  <div>
    <h3>{field.label}</h3>
    {(field.options || []).map(option => (
      <Fragment key={option.value}>
        <label htmlFor={option.value}>
          <input
            type="radio"
            id={option.value}
            name={field._uid}
            value={option.value}
            checked={value === option.value}
            onChange={e => fieldChanged(field._uid, e.target.value)}
          />
          {option.label}
        </label>
      </Fragment>
    ))}
  </div>
);
