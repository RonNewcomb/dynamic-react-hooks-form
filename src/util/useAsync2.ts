/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';

export interface UseAsyncOptions<T> {
  /** controls whether asyncFn simply being reference-inequal will trigger a reload */
  asyncFnNeedsUseCallback?: boolean;
  /** if not a truthy value, your async function isn't called  */
  if?: boolean | any;
  /** default value to use while initial loading, or if "if" prevented invocation  */
  else?: T;
  /** debounce timer, default 100ms */
  debounceTime?: number;
}

type UseAsyncReturnValue<T> = [T | undefined, boolean, Error | undefined, () => void];

/**
 * Calls the async function  if a value in the dep array changed.
 * Returns tuple of [data from async promise, isLoading, error, forceRetry()]
 * options are:
 *   asyncFnNeedsUseCallback=false (default) allows lambdas as asyncFn without re-rendering every time.
 *   asyncFnNeedsUseCallback=true + a lambda means the lambda requires useCallback wrapping.
 *   if = if false, will not call the asyncFn. Useful if necessary values aren't yet provided.
 *   else = the default value to use for when the asyncFn is loading or never yet called.
 */
export const useAsync = <T, A extends unknown[]>(
  asyncFn: (...depArrayBecomesParams: [...A]) => Promise<T>,
  depArray: [...A],
  options: UseAsyncOptions<T> = {}
): UseAsyncReturnValue<T> => {
  const options_if = !Object.prototype.hasOwnProperty.call(options, 'if') || !!options.if;
  const [result, setResult] = useState<UseAsyncReturnValue<T>>(() => [options.else, options_if, undefined, undefined as any]);
  const newInput = useMemo(() => depArray, depArray); // note this is depArray not [depArray]
  const changedInput = useDebounce(newInput, options.debounceTime || 100);

  const reload = useCallback(() => {
    if (!options_if) return;
    let latest: true | undefined = true;
    setResult(old => [old[0], true, undefined, undefined as any]); // don't clear out Data on new call; makes UX less jumpy
    asyncFn
      .call(void 0, ...depArray)
      .then(data => latest && setResult([data, false, undefined, undefined as any]))
      .catch(err => latest && setResult([options.else, false, err, undefined as any]));
    return () => (latest = undefined);
  }, [changedInput, asyncFn, options_if]);

  useEffect(reload, options.asyncFnNeedsUseCallback ? [changedInput, asyncFn] : [changedInput]);

  result[3] = reload; // not using .concat() keeps the returned value reference-equal to previous render
  return result;
};
