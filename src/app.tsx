import { useState } from "react";
import type { IField } from "./SuperDynamicForm/ISuperDynamicForm";
import { SuperDynamicForm } from "./SuperDynamicForm/SuperDynamicForm";

export const App = () => {
  const [result, setResult] = useState<IField[]>();

  const onDone = (finalForm: IField[]) => setResult(finalForm);

  if (result) return <pre>{JSON.stringify(result, null, 2)}</pre>;

  return <SuperDynamicForm query="?querystring=" endpoint="http://hostname.com" onDone={onDone} />;
};
