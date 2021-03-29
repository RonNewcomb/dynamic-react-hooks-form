import type { IOption, IField } from "../SuperDynamicForm/SuperDynamicForm";
import * as MockServer from "./mockServer";

export const milliseconds = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getDynamicForm(query: string, endpoint: string): Promise<IField[]> {
    await milliseconds(Math.random() * 2000 + 1000);
    //if (Math.random() < 0.1) throw Error("HTTP 500: GET ${endpoint}/getDynamicForm/${query} timed out");
    return MockServer.mockDataFromServer();
}

export async function getOptions(optionsAt: string): Promise<IOption[]> {
    await milliseconds(Math.random() * 2000 + 1000);
    if (Math.random() < 0.01) throw Error(`HTTP 500: GET /getOptions/${optionsAt} timed out`);
    return MockServer.mockOptionsFromServer(optionsAt);
}

export async function pseudoSubmit(formAsIs: IField[]): Promise<IField[]> {
    //console.log("SERVER: pseudoSubmitting", JSON.stringify(formAsIs, null, 2));
    await milliseconds(Math.random() * 2000 + 1000);
    if (Math.random() < 0.01) throw Error(`HTTP 500: POST /pseudoSubmit`);
    return MockServer.mockDataFromServer(formAsIs);
}

export interface ISubmitDynamicFormResult {
    success?: boolean;
    errors?: string[];
}

export async function submitDynamicForm(form: IField[]): Promise<ISubmitDynamicFormResult> {
    //console.log(JSON.stringify(form, null, 4));
    await milliseconds(Math.random() * 2000 + 1000);
    if (Math.random() < 0.1) throw Error(`HTTP 500: POST /submitDynamicForm timed out`);
    const returnedFromServer = MockServer.mockSubmit(form);
    // transform server data.  A 200 with validation errors becomes just another Error object
    if (returnedFromServer.errors && returnedFromServer.errors.length)
        throw Error(returnedFromServer.errors.join('\n'));
    return returnedFromServer;
}
