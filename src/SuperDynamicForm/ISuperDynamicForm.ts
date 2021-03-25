
export type SuperDynamicFormFieldTypes = 'section' | 'field_group' | 'pick1' | 'text' | 'email' | 'number';

export interface ISection {
    id: string;
    type: SuperDynamicFormFieldTypes;
    label: string;
    fields: IField[];
    conditional?: ICondition;
}

export interface ICondition {
    value: string;
    fieldId: string;
}

export interface IField {
    id: string;
    label: string;
    type: SuperDynamicFormFieldTypes;
    options?: IOption[];    // if type is a select or somesuch
    fields?: IField[];      // if type == 'field_group'
    conditional?: ICondition;
}

export interface IOption {
    label: string;
    value: string;
}
