import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { PagedResponse } from 'src/components/AsyncTable/reactTableApi';
import { emptyPagedResponseOn404OrRethrow, orThrow } from 'src/components/utils';
import { useApi } from 'src/hooks/useApi';
import { useThrottling } from 'src/hooks/useThrottling';

type IApiGetManyContext = <T>(url: string) => Promise<T[]>;

const ApiGetManyContext = createContext<IApiGetManyContext>(_ => orThrow('Get() called on defaultApiGetManyContext'));

export const ApiGetManyProvider = ({ children }: PropsWithChildren<{}>) => {
  const thingsPromises = useRef<Record<string, Promise<any[]>>>({}); /* url => fn of promise of things */
  const [_things, setThings] = useState<Record<string, any[]>>({}); /* url => things */
  const throttle = useThrottling();
  const api = useApi();

  const mounted = useRef<true | undefined>(true);
  useEffect(() => () => (mounted.current = undefined), []);

  const getThings = useCallback(
    async <T,>(url: string): Promise<T[]> => {
      if (!thingsPromises.current[url] && mounted)
        thingsPromises.current[url] = throttle(() =>
          api
            .get<PagedResponse<T>>(url)
            .catch<PagedResponse<T>>(emptyPagedResponseOn404OrRethrow)
            .then(w => {
              const things = w.data || [];
              if (mounted) setThings(old => ({ ...old, [url]: things }));
              return things;
            })
        );
      return thingsPromises.current[url];
    },
    [api, throttle]
  );
  return <ApiGetManyContext.Provider value={getThings}>{children}</ApiGetManyContext.Provider>;
};

/**
 * This calls api.get(...) with the url you provide, throttles multiple calls, caches the result,
 * turns 404s to empty arrays, and offers you an identity-stable function that returns a promise of your results
 * which will only cause each child component to re-render on promise resolution, instead of every
 * child re-rendering on a growing cache being updated.
 */
export const useApiGetMany = () => useContext<IApiGetManyContext>(ApiGetManyContext);
