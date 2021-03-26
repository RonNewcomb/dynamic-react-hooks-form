
export type SuperDynamicFormFieldTypes = 'section' | 'field_group' | 'pick1' | 'text' | 'email' | 'number';

export interface ICondition {
    value: string;
    fieldId: string;
}

export interface IField {
    id: string;
    type: SuperDynamicFormFieldTypes;
    label: string;
    options?: IOption[];    // if type is a select or somesuch
    optionsAt?: string;
    fields?: IField[];      // if type == 'field_group'
    conditional?: ICondition;
    hasConditionalFields?: boolean;
    value?: string; // raw value that user inputted into HTMLInputElement
}

export interface IOption {
    label: string;
    value: string;
}

export interface IOptionsDetail {
    options?: IOption[];    // if type is a select or somesuch
    optionsAt?: string;
    atLeast?: number; // default 1, please
    atMost?: number; // default 1, please
}
