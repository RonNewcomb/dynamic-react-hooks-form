import { IOption, IField, findField } from "../SuperDynamicForm/SuperDynamicForm";
import type { ISubmitDynamicFormResult } from "./api";

// helper for nice one-liners
function log(...args: any[]): true {
    console.log("SERVER:", ...args);
    return true;
}

export const mockSubmit = (form: IField[]): ISubmitDynamicFormResult => {
    if (Math.random() < 0.1) return { errors: ["Validation error 1", "Validation error 2"] };
    return { success: true }
}

const provincesForCountry: Record<string, IOption[]> = {
    'USA': [{ label: 'WA' }, { label: 'OR' }, { label: 'CA', }],
    'China': [{ label: 'Tianjin' }, { label: 'Shanghai' }, { label: 'Beijing', }],
};

const citiesForProvince: Record<string, IOption[]> = {
    'WA': [{ label: 'Seattle', }],
    'OR': [{ label: 'Portland', }],
    'CA': [{ label: 'Los Angeles', }, { label: 'San Francisco', }],
    'Tianjin': [{ label: 'Tianjin', }],
    'Shanghai': [{ label: 'Shanghai', }],
    'Beijing': [{ label: 'Beijing', }],
};

export const mockOptionsFromServer = (url: string): IOption[] => {
    log("mockOptionsFromServer url", url);
    switch (url) {
        case "/options/s2.radios1":
            return [
                { label: "Option 1", value: "one" },
                { label: "Option 2", value: "two" }
            ];
        case "/options/s3.moreradio":
            return [
                { label: "More Option 1", value: "one" },
                { label: "More Option 2", value: "two" }
            ];
        case "/options/s4.toggle":
            return [
                { label: "Third Option 1", value: "one" },
                { label: "Third Option 2", value: "two" }
            ];
        default:
            // not caring about uppercase/lowercase text
            // not caring about where in the url the value is (always assuming at the end)
            // not caring about values which have a / ? & = in them
            // not caring about making an incredible well-polished mock server
            const i = Math.max(url.lastIndexOf('/'), url.lastIndexOf('?'), url.lastIndexOf('&'), url.lastIndexOf('='));
            const bossValue = url.substr(i + 1);
            if (url.startsWith('/provincesForCountry') && provincesForCountry[bossValue]) return provincesForCountry[bossValue];
            if (url.startsWith('/citiesForProvince') && citiesForProvince[bossValue]) return citiesForProvince[bossValue];
            log('HTTP 404: ' + url);
            return [] as IOption[];
    }
}

interface IConditionsOnFields {
    ifTheField: string; // field.id
    hasTheValue: string; // "*" means "anything that would pass a IsRequired validation"
    thenShowField: string; // field.id
}

export const mockDataFromServer = (formAsIs?: IField[]) => {
    //if (formAsIs) log("received", formAsIs);

    const conditions: IConditionsOnFields[] = [
        {
            ifTheField: "s2.radios1",
            hasTheValue: "two",
            thenShowField: "s2.condtext",
        },
        {
            ifTheField: "s2.radios1",
            hasTheValue: "one",
            thenShowField: "s3",
        },
        {
            ifTheField: "s2.radios1",
            hasTheValue: "two",
            thenShowField: "s4",
        },
        {
            ifTheField: "s1.where.country",
            hasTheValue: "*",
            thenShowField: "s1.where.province",
        },
        {
            ifTheField: "s1.where.province",
            hasTheValue: "*",
            thenShowField: "s1.where.city",
        },
    ];

    const returnValueHolder: IField = { id: 'ROOT', type: 'text', label: '', fields: [] } as IField;

    const fields = formAsIs || returnValueHolder.fields;

    const addField = (parentField: IField | null, newSubField: IField): IField | null => {
        if (!parentField) return null; // parent field was conditional, and removed.
        if (!parentField.fields) parentField.fields = [];
        const cond = conditions.find(f => f.thenShowField === newSubField.id);
        if (cond) {
            //log(`if ${cond.ifTheField} has ${cond.hasTheValue === '*' ? 'any value' : cond.hasTheValue} then show the field ${cond.thenShowField}`);
            const independentField = findField(cond.ifTheField, fields);
            if (!independentField) return log(`While rendering ${newSubField.id}, ${cond.ifTheField} doesn't exist.  (Was it also conditional?)`) && null;
            const independentFieldCurrentValue = independentField?.value;
            if (cond.hasTheValue === '*') {
                if (!independentFieldCurrentValue)
                    return log(`${cond.ifTheField} has no value yet`) && null;
            }
            else if (cond.hasTheValue != independentFieldCurrentValue)
                return log(`${cond.ifTheField} had ${independentFieldCurrentValue} instead of ${cond.hasTheValue}`) && null;
        }
        parentField.fields.push(newSubField);
        newSubField.value = findField(newSubField.id, fields)?.value;
        if (conditions.find(f => f.ifTheField === newSubField.id))
            newSubField.hasConditionalFields = true;
        return newSubField;
    }

    const s1 = addField(returnValueHolder, {
        type: "section",
        label: "Section 1",
        id: "s1",
    });
    const s1g1 = addField(s1, {
        type: "field_group",
        label: "Name",
        id: "s1.g1"
    });
    addField(s1g1, {
        label: "First Name",
        type: "text",
        id: "s1.g1.firstname"
    });
    addField(s1g1, {
        label: "Last Name",
        type: "text",
        id: "s1.g1.lastname",
        required: true,
    });
    addField(s1, {
        label: "Email",
        type: "email",
        id: "s1.email"
    });
    addField(s1, {
        label: "Phone",
        type: "text",
        id: "s1.phone"
    });
    addField(s1, {
        label: "Number of Dependents",
        type: "number",
        id: "s1.numDepents",
        value: 3 as any,
        minValue: 0,
        required: true,
    });
    const where = addField(s1, {
        label: "Origin",
        type: "field_group",
        id: "s1.where"
    });
    addField(where, {
        label: "Country",
        type: "pick1",
        id: "s1.where.country",
        options: [
            { label: "USA", value: "USA" },
            { label: "China", value: "China" },
        ]
    });
    addField(where, {
        label: "Province",
        type: "pick1",
        id: "s1.where.province",
        optionsUrl: '/provincesForCountry/{s1.where.country}'
    });
    addField(where, {
        label: "City",
        type: "pick1",
        id: "s1.where.city",
        optionsUrl: '/citiesForProvince/{s1.where.province}'
    });

    const s2 = addField(returnValueHolder, {
        type: "section",
        label: "Section 2",
        id: "s2",
    });
    const s2radios1 = addField(s2, {
        label: "Radio Buttons 1",
        type: "pick1",
        id: "s2.radios1",
        hasConditionalFields: true,
        optionsUrl: "/options/s2.radios1",
    });
    addField(s2, {
        label: "Conditional Field",
        type: "text",
        id: "s2.condtext",
    });

    const s3 = addField(returnValueHolder, {
        type: "section",
        label: "Section 3a",
        id: "s3",
    });
    addField(s3, {
        label: "More radio buttons",
        type: "pick1",
        id: "s3.moreradio",
        optionsUrl: "/options/s3.moreradio",
    });

    const s4 = addField(returnValueHolder, {
        type: "section",
        label: "Section 3b",
        id: "s4",
    });
    addField(s4, {
        label: "Something to toggle",
        type: "pick1",
        id: "s4.toggle",
        optionsUrl: "/options/s4.toggle",
    });
    let s4g1 = addField(s4, {
        type: "field_group",
        label: "Name",
        id: "s4.g1",
    });
    addField(s4g1, {
        label: "First Name",
        type: "text",
        id: "s4.g1.fname"
    });
    addField(s4g1, {
        label: "Last Name",
        type: "text",
        id: "s4.g1.lname"
    });
    addField(s4, {
        label: "Email",
        type: "email",
        id: "s4.email"
    });
    addField(s4, {
        label: "Phone",
        type: "text",
        id: "s4.phone"
    });

    const s5 = addField(returnValueHolder, {
        type: "section",
        label: "Section 4",
        id: "s5",
    });
    addField(s5, {
        label: "Final Comment",
        type: "text",
        id: "s5.final"
    });

    addField(returnValueHolder, {
        label: " ",
        type: "separator",
        id: "finalBeforeSubmit"
    });
    if (false) {
        addField(returnValueHolder, {
            label: "Submit",
            type: "submit",
            id: "submitBtn"
        });
    } else {
        addField(returnValueHolder, {
            label: "Completion options",
            type: "submit",
            id: "submitBtns",
            options: [{ label: "Save as Draft" }, { label: "Save" }]
        });
    }

    log(formAsIs ? 'pseudoSubmit' : '', "returns", returnValueHolder.fields);
    return returnValueHolder.fields!;
}
