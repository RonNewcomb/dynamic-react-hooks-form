import { useState, useCallback, useEffect } from "react";

/** any function that returns a promise */
export type IUseAsyncGettor<T> = (...yourFunctionArgs: any[]) => Promise<T>;

/** return type of the useAsync hook, a tuple [value, isLoading, Error, refresh()] */
export type IUseAsync<T> = [T | undefined, boolean, Error | undefined, () => void];

const NoFunction = () => Promise.resolve(undefined as any);

/** 
 * Parameters are your gettor function followed by your gettor's parameters.
 *
 * Type arguments are <return_value's_type, "typeof" gettor function>
 *  
 * Returns a tuple  [ return_value, isLoading, Error, refresh() ]
 * 
 * Example:
 * 
 * const [sectionsData, isLoading, serverError, refreshSections] = useAsync<ISection[], typeof getSectionData>(getSectionData, "query", "endpoint");
 * 
 * Error and Value will never both be defined at the same time.
 * Initialized to isLoading=true, value & Error are undefined.
 * Calling refresh() will immediately set Value & Error undefined. */
export function useAsync<T, F extends IUseAsyncGettor<T>>(gettor: F, ...rest: Parameters<F>): IUseAsync<T> {
  const [tuple, setTuple] = useState<IUseAsync<T>>([undefined, true, undefined, NoFunction]);
  const [parameters, setParameters] = useState(rest);

  if (parameters !== rest && parameters.some((_, i) => parameters[i] !== rest[i])) setParameters(rest); // change detection on parameters

  const callGettor: () => void = useCallback(() => {
    setTuple([undefined, true, undefined, callGettor]);
    return gettor
      .apply(null, parameters)
      .then(val => setTuple([val, false, undefined, callGettor]))
      .catch(er => setTuple([undefined, false, er, callGettor]));
  }, [gettor, parameters]);

  useEffect(callGettor, [callGettor]);

  return tuple;
}
