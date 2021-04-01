import { useState, useCallback, useEffect, Dispatch, SetStateAction } from "react";

/** any function that returns a promise */
export type IUseAsyncGettor<T> = (...yourFunctionArgs: any[]) => Promise<T>;

export interface IUseAsyncResponse<T> {
  isLoading: boolean;
  error?: Error;
  refresh: () => void;
  promise: Promise<T | void>;
}

/** return type of the useAsync hook, a tuple [value, responseObj] */
export type IUseAsync<T> = [T | undefined, IUseAsyncResponse<T>];

/** wrap arounnd a useState call to return a safter setState function */
export function useUnlessUnmounted<T>(useStateTuple: [val: T, setVal: Dispatch<SetStateAction<T>>]): [T, Dispatch<SetStateAction<T>>] {
  const [val, setVal] = useStateTuple;
  const [isMounted, setIsMounted] = useState(true);
  useEffect(() => () => setIsMounted(false), []);
  return [val, newVal => (isMounted ? setVal(newVal) : () => void 0)];
}

/** Like useState, but if the component unmounts, will ignore any setValue calls */
export function useStateAsync<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [val, setVal] = useState(initialState);
  const [isMounted, setIsMounted] = useState(true);
  useEffect(() => () => setIsMounted(false), []);
  return [val, newVal => (isMounted ? setVal(newVal) : () => void 0)];
}

/** 
 * Parameters are your gettor function followed by your gettor's parameters.
 *
 * Type arguments are <return_value's_type, "typeof" gettor function>
 *  
 * Returns a tuple  [ return_value, responseObject ]
 * 
 * Example:
 * 
 * const [data, response] = useAsync<ISection[], typeof getSectionData>(getSectionData, "query", "endpoint");
 * 
 * ...where   getSectionData(query: string, endpoint: string): Promise<ISection[]>
 * 
 * value and response.error will never both be defined at the same time.
 * Initialized to response.isLoading=true, value & response.error are undefined.
 * Calling response.refresh() will immediately set Value & response.error undefined.
 */
export function useAsync<T, F extends IUseAsyncGettor<T>>(gettor: F, ...rest: Parameters<F>): IUseAsync<T> {
  let [parameters, setParameters] = useState(rest);
  if (parameters !== rest && parameters.some((_, i) => parameters[i] !== rest[i]))
    setParameters(rest);

  const refresh: () => void = useCallback(() => {
    const promise: Promise<T | void> = gettor
      .apply(null, parameters)
      .then(value => setTuple([value, { isLoading: false, promise, refresh, error: undefined }]))
      .catch(error => setTuple([undefined, { isLoading: false, promise, refresh, error }]));
    setTuple([undefined, { isLoading: true, promise, refresh, error: undefined }]);
    return promise;
  }, [gettor, parameters]);

  useEffect(() => {
    refresh();
    return () => { setTuple = setParameters = (() => undefined) } // for when async finishes after user navs away
  }, [refresh]);

  let [tuple, setTuple] = useState<IUseAsync<T>>([undefined, { isLoading: true, refresh, promise: Promise.resolve() }]);
  return tuple;
}
