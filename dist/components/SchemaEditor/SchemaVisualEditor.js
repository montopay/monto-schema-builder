import { jsx, jsxs } from "react/jsx-runtime";
import { createFieldSchema, updateObjectProperty, updatePropertyRequired } from "../../lib/schemaEditor.js";
import { asObjectSchema, isBooleanSchema } from "../../types/jsonSchema.js";
import AddFieldButton from "./AddFieldButton.js";
import SchemaFieldList from "./SchemaFieldList.js";
import { useTranslation } from "../../hooks/use-translation.js";
const SchemaVisualEditor = ({ schema, onChange })=>{
    const t = useTranslation();
    const handleAddField = (newField)=>{
        const fieldSchema = createFieldSchema(newField);
        let newSchema = updateObjectProperty(asObjectSchema(schema), newField.name, fieldSchema);
        if (newField.required) newSchema = updatePropertyRequired(newSchema, newField.name, true);
        onChange(newSchema);
    };
    const handleEditField = (name, updatedField)=>{
        const fieldSchema = createFieldSchema(updatedField);
        let newSchema = updateObjectProperty(asObjectSchema(schema), updatedField.name, fieldSchema);
        newSchema = updatePropertyRequired(newSchema, updatedField.name, updatedField.required || false);
        if (name !== updatedField.name) {
            const { properties, ...rest } = newSchema;
            const { [name]: _, ...remainingProps } = properties || {};
            newSchema = {
                ...rest,
                properties: remainingProps
            };
            newSchema = updateObjectProperty(newSchema, updatedField.name, fieldSchema);
            if (updatedField.required) newSchema = updatePropertyRequired(newSchema, updatedField.name, true);
        }
        onChange(newSchema);
    };
    const handleDeleteField = (name)=>{
        if (isBooleanSchema(schema) || !schema.properties) return;
        const { [name]: _, ...remainingProps } = schema.properties;
        const newSchema = {
            ...schema,
            properties: remainingProps
        };
        if (newSchema.required) newSchema.required = newSchema.required.filter((field)=>field !== name);
        onChange(newSchema);
    };
    const hasFields = !isBooleanSchema(schema) && schema.properties && Object.keys(schema.properties).length > 0;
    return /*#__PURE__*/ jsxs("div", {
        className: "p-4 h-full flex flex-col overflow-auto jsonjoy",
        children: [
            /*#__PURE__*/ jsx("div", {
                className: "mb-6 shrink-0",
                children: /*#__PURE__*/ jsx(AddFieldButton, {
                    onAddField: handleAddField
                })
            }),
            /*#__PURE__*/ jsx("div", {
                className: "grow overflow-auto",
                children: hasFields ? /*#__PURE__*/ jsx(SchemaFieldList, {
                    schema: schema,
                    onAddField: handleAddField,
                    onEditField: handleEditField,
                    onDeleteField: handleDeleteField
                }) : /*#__PURE__*/ jsxs("div", {
                    className: "text-center py-10 text-muted-foreground",
                    children: [
                        /*#__PURE__*/ jsx("p", {
                            className: "mb-3",
                            children: t.visualEditorNoFieldsHint1
                        }),
                        /*#__PURE__*/ jsx("p", {
                            className: "text-sm",
                            children: t.visualEditorNoFieldsHint2
                        })
                    ]
                })
            })
        ]
    });
};
const SchemaEditor_SchemaVisualEditor = SchemaVisualEditor;
export { SchemaEditor_SchemaVisualEditor as default };
