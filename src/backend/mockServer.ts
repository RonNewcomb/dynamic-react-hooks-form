import { IOption, IField, findField } from "../SuperDynamicForm/ISuperDynamicForm";
import type { ISubmitDynamicFormResult } from "./api";

export const mockSubmit = (form: IField[]): ISubmitDynamicFormResult => {
    if (Math.random() < 0.1) return { errors: ["Validation error 1", "Validation error 2"] };
    return { success: true }
}

export const mockOptionsFromServer = (optionsAtUrl: string): IOption[] => {
    console.log("SERVER: mockOptionsFromServer url", optionsAtUrl);
    switch (optionsAtUrl) {
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
            console.error('HTTP 404: ' + optionsAtUrl);
            return [] as IOption[];
    }
}

interface ICond {
    ifTheField: string;
    hasTheValue: string;
    thenShowField: string;
}

export const mockDataFromServer = (formAsIs?: IField[]) => {
    const conditionals: ICond[] = [
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

    const fields = formAsIs || defaultInitialForm;
    //if (formAsIs) console.log("SERVER: received", formAsIs);

    const addField = (parentField: IField | null, newSubField: IField): IField | null => {
        if (!parentField) return null; // parent field was conditional, and removed.
        if (!parentField.fields) parentField.fields = [];
        const conditionalOn = conditionals.find(f => f.thenShowField === newSubField.id);
        if (conditionalOn) {
            //console.log("SERVER:", newSubField.id, 'is conditional on the value of', conditionalOn.independentId);
            const independentFieldCurrentValue = findField(conditionalOn.ifTheField, fields)?.value;
            if (!['*', independentFieldCurrentValue].includes(conditionalOn.hasTheValue))
                return null;
        }
        parentField.fields.push(newSubField);
        newSubField.value = findField(newSubField.id, fields)?.value;
        if (conditionals.find(f => newSubField.id === f.ifTheField))
            newSubField.hasConditionalFields = true;
        //if (newSubField.hasConditionalFields) console.log("SERVER:", newSubField.id, 'has conditional fields');
        return newSubField;
    }

    const root: IField = { id: 'ROOT', type: 'text', label: '', fields: [] } as IField;

    const s1 = addField(root, {
        type: "section",
        label: "Page 1",
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
        id: "s1.g1.lastname"
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
    const where = addField(s1, {
        label: "",
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

    const s2 = addField(root, {
        type: "section",
        label: "Page 2",
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

    const s3 = addField(root, {
        type: "section",
        label: "Page 3a",
        id: "s3",
    });
    addField(s3, {
        label: "More radio buttons",
        type: "pick1",
        id: "s3.moreradio",
        optionsUrl: "/options/s3.moreradio",
    });

    const s4 = addField(root, {
        type: "section",
        label: "Page 3b",
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

    const s5 = addField(root, {
        type: "section",
        label: "Page 4",
        id: "s5",
    });
    addField(s5, {
        label: "Final Comment",
        type: "text",
        id: "s5.final"
    });
    addField(s5, {
        label: " ",
        type: "separator",
        id: "s5.sep"
    });

    console.log("SERVER: returns", root.fields);
    return root.fields!;
}

const defaultInitialForm: IField[] = [
    {
        type: "section",
        label: "Page 1",
        id: "s1",
        fields: [
            {
                type: "field_group",
                label: "Name",
                id: "s1.g1",
                fields: [
                    {
                        label: "First Name",
                        type: "text",
                        id: "s1.g1.firstname"
                    },
                    {
                        label: "Last Name",
                        type: "text",
                        id: "s1.g1.lastname"
                    }
                ]
            },
            {
                label: "Email",
                type: "email",
                id: "s1.email"
            },
            {
                label: "Phone",
                type: "text",
                id: "s1.phone"
            }
        ]
    },
    {
        type: "section",
        label: "Page 2",
        id: "s2",
        fields: [
            {
                label: "Radio Buttons 1",
                type: "pick1",
                id: "s2.radios1",
                optionsUrl: "/options/s2.radios1",
            },
            {
                label: "Conditional Field",
                type: "text",
                id: "s2.condtext",
            }
        ]
    },
    {
        type: "section",
        label: "Page 3a",
        id: "s3",
        fields: [
            {
                label: "More radio buttons",
                type: "pick1",
                id: "s3.moreradio",
                optionsUrl: "/options/s3.moreradio",
            }
        ]
    },
    {
        type: "section",
        label: "Page 3b",
        id: "s4",
        fields: [
            {
                label: "Something to toggle",
                type: "pick1",
                id: "s4.toggle",
                optionsUrl: "/options/s4.toggle",
            },
            {
                type: "field_group",
                label: "Name",
                id: "s4.g1",
                fields: [
                    {
                        label: "First Name",
                        type: "text",
                        id: "s4.g1.fname"
                    },
                    {
                        label: "Last Name",
                        type: "text",
                        id: "s4.g1.lname"
                    }
                ]
            },
            {
                label: "Email",
                type: "email",
                id: "s4.email"
            },
            {
                label: "Phone",
                type: "text",
                id: "s4.phone"
            }
        ]
    },
    {
        type: "section",
        label: "Page 4",
        id: "s5",
        fields: [
            {
                label: "Final Comment",
                type: "text",
                id: "s5.final"
            }
        ]
    }
];