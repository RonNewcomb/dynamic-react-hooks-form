import { useEffect, useReducer } from "react";

export type AdvanceStateFn<T> = (oldState: T) => T; // returns newState
export type GiveMeTheFnToUseOnNextRender<T> = (fn: AdvanceStateFn<T>) => void;

// alternative 1 ////
export function useFunctionOnNextRender<T>(initialState: T, initializer?: AdvanceStateFn<T>): [T, GiveMeTheFnToUseOnNextRender<T>] {
  const act = (state: T, action: AdvanceStateFn<T>): T => action(state);
  return initializer
    ? useReducer(act, initialState, initializer)
    : useReducer(act, initialState);
} // returns [currentValue, onNextRender]


// alternative 2 ////
// one-liners so the "act" function is stand-alone, but need the type of "act" explicitly passed to useReducer
export type StateAdvancer<T> = (state: T, action: AdvanceStateFn<T>) => T;

export const act = <T>(oldState: T, action: AdvanceStateFn<T>): T => action(oldState);

export const useStateUpdater = <T>(initialState: T, initializer?: AdvanceStateFn<T>): [T, GiveMeTheFnToUseOnNextRender<T>] =>
  initializer
    ? useReducer<StateAdvancer<T>, T>(act, initialState, initializer)
    : useReducer<StateAdvancer<T>>(act, initialState);


/// example //////

const reset = (state: number) => 0;

function MyTestComponent2({ step }: { step: number }) {
  const tick = (state: number, factor: number = 1) => state + step * factor;
  const untick = (state: number) => state - step;
  const [count1, renderAfterCalling] = useFunctionOnNextRender(0);
  const [count2, updateBy] = useStateUpdater(0);

  useEffect(() => {
    const id = setInterval(() => updateBy(s => tick(s, 2)), 1000);
    return () => clearInterval(id);
  }, []);

  return null;
}
