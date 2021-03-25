import { useState, useCallback, useEffect } from "react";

// export type IUseAsync<T> = (T | undefined | boolean)[]; // [T | undefined, boolean];
export type IUseAsync<T> = [T | undefined, boolean];

export function useAsync<T>(gettor: (...acceptsRest: any[]) => Promise<T>, rest: any[]): IUseAsync<T> {
  const [retval, setRetval] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [parameters, setParameters] = useState(rest);

  if (parameters !== rest && parameters.some((_, i) => parameters[i] !== rest[i])) setParameters(rest); // change detection on parameters

  const callAsyncFn = useCallback(() => {
    setRetval(undefined);
    setIsLoading(true);
    gettor.apply(null, parameters).then(val => {
      setRetval(val);
      setIsLoading(false);
    });
  }, [gettor, parameters]);

  useEffect(callAsyncFn, [callAsyncFn]);

  return [retval, isLoading];
}
