import { useEffect } from "react";
import { AdvanceStateFn, useFunctionOnNextRender } from "./util/useFunctionOnNextRender";

export const FilePage = () => <div>Nothing to see here.</div>;

const reset: AdvanceStateFn<number> = (state: number) => 0;

function MyTestComponent2({ step }: { step: number }) {
  const tick = (state: number) => state + step;
  const untick = (state: number) => state - step;
  const [count, renderAfterCalling] = useFunctionOnNextRender(0);

  useEffect(() => {
    const id = setInterval(() => renderAfterCalling(tick), 1000);
    return () => clearInterval(id);
  }, []);

  return null;
}
