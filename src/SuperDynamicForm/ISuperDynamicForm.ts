export type SuperDynamicFormFieldTypes = 'section' | 'field_group' | 'pick1' | 'text' | 'email' | 'number' | 'separator';

export interface IField {
    id: string;
    type: SuperDynamicFormFieldTypes;
    label: string;

    // raw value that user inputted into HTMLInputElement
    // Sent to server on submit, sent & received from server on pseudoSubmit and maybe initial load as well
    value?: string;

    // if type == 'field_group' or 'section' or other such aggregate
    fields?: IField[];

    // if type is 'pick1'
    options?: IOption[]; // if blank, .optionsUrl must have URL to get list
    optionsUrl?: string;  // if blank, .options must have list

    // if true then requires pseudosubmit onChange
    hasConditionalFields?: boolean;
}

export interface IOption {
    label: string;
    value?: string; // if missing, use label as value
}

export function findField(fieldId: string, fields?: IField[]): IField | undefined {
    if (fields)
        for (let f of fields) {
            if (f.id === fieldId) return f;
            const result = findField(fieldId, f.fields);
            if (result) return result;
        }
    return undefined;
}
