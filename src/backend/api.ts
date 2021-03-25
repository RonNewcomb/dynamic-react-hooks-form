import { mockDataFromServer } from "./formdata";
import { ISection } from "../SuperDynamicForm/ISuperDynamicForm";

export const milliseconds = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getData(query: string, endpoint: string): Promise<ISection[]> {
    console.log("fetching for", arguments);
    await milliseconds(Math.random() * 2000 + 1000);
    console.log("fetched", endpoint);
    if (Math.random() < 0.1) throw Error("HTTP 500: Server timed out?");
    return mockDataFromServer;
}
