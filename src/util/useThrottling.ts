import { useCallback, useRef } from 'react';

interface PromiseResolver {
  (): void;
}

export const MAX_SIMULTANEOUS_INFLIGHT = 4;

export const useThrottling = () => {
  const numInFlight = useRef(0);
  const functionsToCall = useRef<PromiseResolver[]>([]);

  const checkAndRefire = useCallback(() => {
    if (numInFlight.current >= MAX_SIMULTANEOUS_INFLIGHT) return;
    if (functionsToCall.current.length == 0) return;
    const fn = functionsToCall.current.shift();
    if (typeof fn !== 'function') return;
    numInFlight.current++;
    fn();
  }, []);

  const enqueue = useCallback(
    <T>(asyncFn: () => Promise<T>): Promise<T> => {
      return new Promise<void>(resolve => {
        functionsToCall.current.push(resolve);
        checkAndRefire();
      })
        .then<T, never>(_ => (typeof asyncFn === 'function' ? asyncFn() : asyncFn))
        .finally(() => {
          numInFlight.current--;
          checkAndRefire();
        });
    },
    [checkAndRefire]
  );

  return enqueue;
};

/**
 * runs a maximum of limit async operations at a time with the same ordering guarantees.
 */
export async function mapLimit<T, V>(input: readonly T[], iteratee: (value: T, index: number) => Promise<V>): Promise<V[]> {
  if (!input || !Array.isArray(input)) return [];

  const size = input.length;
  const allValues = new Array(size);
  const results = new Array(size);

  let i = 0;
  for (const key in input) {
    allValues[size - 1 - i] = [input[key], i, i];
    ++i;
  }

  const execute = async () => {
    while (allValues.length > 0) {
      const [val, index, key] = allValues.pop();
      results[index] = await iteratee(val, key);
    }
  };

  const allExecutors = [];
  for (let j = 0; j < MAX_SIMULTANEOUS_INFLIGHT; ++j) allExecutors.push(execute());
  await Promise.all(allExecutors);

  return results;
}
