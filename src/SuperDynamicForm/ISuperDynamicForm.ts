
export type SuperDynamicFormFieldTypes = 'section' | 'field_group' | 'pick1' | 'text' | 'email' | 'number' | 'separator';


export interface IField {
    id: string;
    type: SuperDynamicFormFieldTypes;
    label: string;

    value?: string; // raw value that user inputted into HTMLInputElement; type is NOT section or field_group

    fields?: IField[];      // if type == 'field_group' or 'section'

    // if type is 'pick1'
    options?: IOption[]; // if blank, .optionsUrl must have URL to get list
    optionsUrl?: string;  // if blank, .options must have list

    hasConditionalFields?: boolean; // if true then requires pseudosubmit onChange
}

export interface IOption {
    label: string;
    value: string;
}
