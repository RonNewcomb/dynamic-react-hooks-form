import { PropsWithChildren } from "react";

interface IProps {
  errors?: (Error | string)[] | Error | string;
}

/**
 * Usage: (can be mixed 'n matched)
 *
 *   <Err>Some message</Err>
 *
 *   <Err error='some string' />
 *
 *   <Err error={exceptionObject} />
 *
 *   <Err errors={validationErrorsAsAnArrayOfStrings} />
 *
 *   <Err errors={arrayOfExceptionObjects} />
 *
 */
export const Err = (props: PropsWithChildren<IProps>) => {
  const array = !props.errors ? [] : Array.isArray(props.errors) ? props.errors : [props.errors];
  if (!array.length && !props.children) return null;
  return (
    <div className="error">
      {props.children}
      {array.map(e => (
        <div>{e instanceof Error ? e.message : e}</div>
      ))}
    </div>
  );
};
