import { mockDataFromServer, mockOptionsFromServer } from "./mockData";
import { IOption, IField } from "../SuperDynamicForm/ISuperDynamicForm";

export const milliseconds = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getDynamicForm(query: string, endpoint: string): Promise<IField[]> {
    await milliseconds(Math.random() * 2000 + 1000);
    if (Math.random() < 0.1) throw Error("HTTP 500: Server timed out?");
    return mockDataFromServer();
}

export async function getOptions(optionsAt: string): Promise<IOption[]> {
    await milliseconds(Math.random() * 2000 + 1000);
    if (Math.random() < 0.1) throw Error("HTTP 500: Server timed out?");
    return mockOptionsFromServer(optionsAt);
}

export async function pseudoSubmit(formAsIs: IField[]): Promise<IField[]> {
    await milliseconds(Math.random() * 2000 + 1000);
    if (Math.random() < 0.1) throw Error("HTTP 500: Server timed out?");
    return mockDataFromServer(formAsIs);
}

export async function submitDynamicForm(form: IField[]): Promise<boolean> {
    console.log(JSON.stringify(form));
    await milliseconds(Math.random() * 2000 + 1000);
    if (Math.random() < 0.1) throw Error("HTTP 500: Server timed out?");
    return true;
}
