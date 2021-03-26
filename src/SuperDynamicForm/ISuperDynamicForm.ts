
export type SuperDynamicFormFieldTypes = 'section' | 'field_group' | 'pick1' | 'text' | 'email' | 'number';

export interface ICondition {
    value: string;
    fieldId: string;
}

export interface IField {
    id: string;
    type: SuperDynamicFormFieldTypes;
    label: string;

    value?: string; // raw value that user inputted into HTMLInputElement; type is NOT section or field_group

    fields?: IField[];      // if type == 'field_group' or 'section'

    optionsDetail?: IOptionsDetail; // if type is 'pick1'

    hasConditionalFields?: boolean; // if true then requires pseudosubmit onChange
}

export interface IOption {
    label: string;
    value: string;
}

export interface IOptionsDetail {
    atLeast?: number; // default 1, please
    atMost?: number; // default 1, please
    options?: IOption[];
    optionsAt?: string;
}
