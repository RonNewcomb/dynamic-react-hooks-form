import { mockDataFromServer } from "./formdata";
import { ISection } from "./ISuperDynamicForm";

export const milliseconds = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getData(query: string, endpoint: string): Promise<ISection[]> {
    console.log("fetching for", endpoint, query);
    await milliseconds(Math.random() * 2000 + 1000);
    console.log("fetched", endpoint);
    return mockDataFromServer;
}
