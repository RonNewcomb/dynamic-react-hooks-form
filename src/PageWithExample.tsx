import { useEffect, useMemo, useState, Dispatch, SetStateAction } from "react";

export const PageWithExample = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    //setInterval(() => setSeconds(x => x + 1), 2000);
  }, [setSeconds]);

  return (
    <div>
      <MyComponent page={seconds} type={seconds} />
    </div>
  );
};

const someOperationValue = () => console.log("someOperationValue");

export type Soon<T> = Promise<T> & { result?: T };

export function useSoon<T>(url: string): Soon<T> {
  const [state, setState] = useState<Soon<T>>(
    (): Soon<T> =>
      fetch(url)
        .then(r => r.json())
        .catch(_ => "65")
        .then(retval => {
          state.result = retval;
          return state;
        })
  );
  return state;
}

const MyComponent = ({ page, type }: any) => {
  console.log("MYcomponent");
  const defaultState = () => ({
    fetched: someOperationValue(),
    type: type,
  });

  //   const [state, setState] = useState(
  //     (): Soon<number> =>
  //       fetch("/hello").then(async r => {
  //         const retval = await r.json().catch(_ => "65");
  //         setState(p => {
  //           p.result = retval;
  //           return p;
  //         });
  //         return state;
  //       })
  //   );
  const state = useSoon<number>("/HelloWorld");
  return <div>{state.result}</div>;
};
