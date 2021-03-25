import { useState, useCallback, useEffect } from "react";

export type IUseAsyncGettor<T> = (...yourFunctionArgs: any[]) => Promise<T>;

export type IUseAsync<T> = [T | undefined, boolean, Error | undefined, () => void]; // value, isLoading, Error, refresh()

export function useAsync<T, F extends IUseAsyncGettor<T>>(gettor: F, rest: Parameters<F>): IUseAsync<T> {
  const [tuple, setTuple] = useState<IUseAsync<T>>([undefined, true, undefined, () => Promise.resolve(undefined as any)]);
  const [parameters, setParameters] = useState(rest);

  if (parameters !== rest && parameters.some((_, i) => parameters[i] !== rest[i])) setParameters(rest); // change detection on parameters

  const callAsyncFn: () => void = useCallback(() => {
    setTuple([undefined, true, undefined, callAsyncFn]);
    return gettor
      .apply(null, parameters)
      .then(val => setTuple([val, false, undefined, callAsyncFn]))
      .catch(er => setTuple([undefined, false, er, callAsyncFn]));
  }, [gettor, parameters]);

  useEffect(callAsyncFn, [callAsyncFn]);

  return tuple;
}
