
export interface ISection {
    component: string;
    label: string;
    _uid: string;
    fields: IField[];
    conditional?: ICondition;
}

export interface ICondition {
    value: string;
    field: string; // field ID
}

export interface IField {
    component: string;
    label: string;
    type?: string;
    _uid: string;
    options?: IOption[];    // if component is a select or somesuch
    fields?: IField[];      // if component == field_group
    conditional?: ICondition;
}

export interface IOption {
    label: string;
    value: string;
}
