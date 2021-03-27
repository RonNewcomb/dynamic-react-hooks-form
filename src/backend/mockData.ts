import type { IOption, IField } from "../SuperDynamicForm/ISuperDynamicForm";
import type { ISubmitDynamicForm } from "./api";

export const mockSubmit = (form: IField[]): ISubmitDynamicForm => {
    if (Math.random() < 0.1) return { errors: ["Validation error 1", "Validation error 2"] };
    return { success: true }
}

export const mockOptionsFromServer = (optionsAtUrl: string): IOption[] => {
    //console.log("SERVER: mockOptionsFromServer url", optionsAtUrl);
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
    dependentId: string;
    independentId: string;
    valueOfIndependent: string;
}

function flatten(array: IField[], retval: IField[] = []): IField[] {
    array.forEach(item => {
        if (item.id) retval.push(item);
        if (item.fields) flatten(item.fields, retval);
    });
    return retval;
}

export const mockDataFromServer = (formAsIs?: IField[]) => {
    const conditionals: ICond[] = [
        {
            dependentId: "s2.condtext",
            independentId: "s2.radios1",
            valueOfIndependent: "two",
        },
        {
            dependentId: "s3",
            valueOfIndependent: "one",
            independentId: "s2.radios1"
        },
        {
            dependentId: "s4",
            valueOfIndependent: "two",
            independentId: "s2.radios1"
        },
    ];

    const fields: IField[] = formAsIs || [
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
                    optionsDetail: {
                        optionsAt: "/options/s2.radios1",
                    }
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
                    optionsDetail: {
                        optionsAt: "/options/s3.moreradio",
                    }
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
                    optionsDetail: {
                        optionsAt: "/options/s4.toggle",
                    }
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
    const flatFieldList = flatten(fields);
    if (formAsIs) console.log("SERVER: received", flatFieldList);

    const addField = (parentField: IField | null, newSubField: IField): IField | null => {
        if (!parentField) return null; // parent field was conditional, and removed.
        if (!parentField.fields) parentField.fields = [];
        const conditionalOn = conditionals.find(f => f.dependentId === newSubField.id);
        if (conditionalOn) {
            //console.log("SERVER:", newSubField.id, 'is conditional on the value of', conditionalOn.independentId);
            const independentFieldCurrentValue = flatFieldList.find(f => f.id === conditionalOn.independentId)?.value;
            if (independentFieldCurrentValue != conditionalOn.valueOfIndependent)
                return null;
        }
        parentField.fields.push(newSubField);
        newSubField.value = flatFieldList.find(f => f.id === newSubField.id)?.value;
        if (conditionals.find(f => newSubField.id === f.independentId))
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
        optionsDetail: {
            optionsAt: "/options/s2.radios1",
        }
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
        optionsDetail: {
            optionsAt: "/options/s3.moreradio",
        }
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
        optionsDetail: {
            optionsAt: "/options/s4.toggle",
        }
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

    console.log("SERVER: returns", root.fields);
    return root.fields!;
}

