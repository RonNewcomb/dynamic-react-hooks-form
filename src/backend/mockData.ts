import { IOption, ISection } from "../SuperDynamicForm/ISuperDynamicForm";

export const mockOptionsFromServer = (optionsAt: string) => {
    switch (optionsAt) {
        default:
            return [] as IOption[];
    }
}

export const mockDataFromServer: (formAsIs?: ISection[]) => ISection[] = () => [
    {
        type: "section",
        label: "Page 1",
        id: "0c946643-5a83-4545-baea-055b27b51e8a",
        fields: [
            {
                type: "field_group",
                label: "Name",
                id: "eb169f76-4cd9-4513-b673-87c5c7d27e02",
                fields: [
                    {
                        label: "First Name",
                        type: "text",
                        id: "5b9b79d2-32f2-42a1-b89f-203dfc0b6b98"
                    },
                    {
                        label: "Last Name",
                        type: "text",
                        id: "6eff3638-80a7-4427-b07b-4c1be1c6b186"
                    }
                ]
            },
            {
                label: "Email",
                type: "email",
                id: "7f885969-f8ba-40b9-bf5d-0d57bc9c6a8d"
            },
            {
                label: "Phone",
                type: "text",
                id: "f61233e8-565e-43d0-9c14-7d7f220c6020"
            }
        ]
    },
    {
        type: "section",
        label: "Page 2",
        id: "3a30803f-135f-442c-ab6e-d44d7d7a5164",
        fields: [
            {
                label: "Radio Buttons",
                type: "pick1",
                id: "bd90f44a-d479-49ae-ad66-c2c475dca66b",
                options: [
                    { label: "Option 1", value: "one" },
                    { label: "Option 2", value: "two" }
                ]
            },
            {
                label: "Conditional Field",
                type: "text",
                id: "bd90f44a-d479-49ae-ad66-c2c475daa66b",
                conditional: {
                    value: "two",
                    fieldId:
                        "3a30803f-135f-442c-ab6e-d44d7d7a5164_bd90f44a-d479-49ae-ad66-c2c475dca66b"
                }
            }
        ]
    },
    {
        type: "section",
        label: "Page 3a",
        id: "cd392929-c62e-4cdb-b4dd-914035c1cc8d",
        conditional: {
            value: "one",
            fieldId: "3a30803f-135f-442c-ab6e-d44d7d7a5164_bd90f44a-d479-49ae-ad66-c2c475dca66b"
        },
        fields: [
            {
                label: "More radio buttons",
                type: "pick1",
                id: "a15bef56-ab67-4b98-a781-4441cc3bba56",
                options: [
                    { label: "Option 1", value: "one" },
                    { label: "Option 2", value: "two" }
                ]
            }
        ]
    },
    {
        type: "section",
        label: "Page 3b",
        id: "1dd4ec7c-fb53-47f4-af1b-1ab8f805b888",
        conditional: {
            value: "two",
            fieldId:
                "3a30803f-135f-442c-ab6e-d44d7d7a5164_bd90f44a-d479-49ae-ad66-c2c475dca66b"
        },
        fields: [
            {
                label: "Something to toggle",
                type: "pick1",
                id: "3ca9237d-e225-4950-a298-f81ce996cb85",
                options: [
                    { label: "Option 1", value: "one" },
                    { label: "Option 2", value: "two" }
                ]
            },
            {
                type: "field_group",
                label: "Name",
                id: "b8406cb5-ff0d-4a83-a8f8-99740b6d91f7",
                fields: [
                    {
                        label: "First Name",
                        type: "text",
                        id: "c6e065e1-dbcb-44ea-831f-ac3af889e964"
                    },
                    {
                        label: "Last Name",
                        type: "text",
                        id: "e279ba9c-3c9b-4df8-b267-d14b3c2adcdd"
                    }
                ]
            },
            {
                label: "Email",
                type: "email",
                id: "a95208a0-7673-48a8-b704-2fb408fa6eec"
            },
            {
                label: "Phone",
                type: "text",
                id: "8dde5083-0619-42d6-8fc7-0563c35d03ad"
            }
        ]
    },
    {
        type: "section",
        label: "Page 4",
        id: "0c946643-5a83-4545-baea-065b27b51e8a",
        fields: [
            {
                label: "Final Comment",
                type: "text",
                id: "f61231e8-565e-43d0-9c14-7d7f220c6020"
            }
        ]
    }
];
