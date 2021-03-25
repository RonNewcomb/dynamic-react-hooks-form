import * as React from "react";
import { mockDataFromServer } from "./formdata";
import { ISection } from "./ISuperDynamicForm";
import { Loading } from "./Loading";
import { SuperDynamicForm } from "./SuperDynamicForm";
import { useAsync } from "./useAsync";

export const App = () => {
  const [formData, success] = useAsync<ISection[]>(getData, ["query", "endpoint"]);
  return <div>{success ? <Loading /> : <SuperDynamicForm formData={formData || []} />}</div>;
};

const milliseconds = (ms: number) => new Promise(r => setTimeout(r, ms));

async function getData(query: string, endpoint: string): Promise<ISection[]> {
  console.log("fetching for", endpoint, query);
  await milliseconds(Math.random() * 2000 + 1000);
  console.log("fetched", endpoint);
  return mockDataFromServer;
}
