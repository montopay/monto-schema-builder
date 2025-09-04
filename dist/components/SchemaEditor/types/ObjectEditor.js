import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "../../../hooks/use-translation.js";
import { getSchemaProperties, removeObjectProperty, updateObjectProperty, updatePropertyRequired } from "../../../lib/schemaEditor.js";
import { asObjectSchema, isBooleanSchema } from "../../../types/jsonSchema.js";
import AddFieldButton from "../AddFieldButton.js";
import SchemaPropertyEditor from "../SchemaPropertyEditor.js";
const ObjectEditor_ObjectEditor = ({ schema, onChange, depth = 0 })=>{
    const t = useTranslation();
    const properties = getSchemaProperties(schema);
    const normalizedSchema = isBooleanSchema(schema) ? {
        type: "object",
        properties: {}
    } : {
        ...schema,
        type: "object",
        properties: schema.properties || {}
    };
    const handleAddProperty = (newField)=>{
        const fieldSchema = {
            type: newField.type,
            description: newField.description || void 0,
            ...newField.validation || {}
        };
        let newSchema = updateObjectProperty(normalizedSchema, newField.name, fieldSchema);
        if (newField.required) newSchema = updatePropertyRequired(newSchema, newField.name, true);
        onChange(newSchema);
    };
    const handleDeleteProperty = (propertyName)=>{
        const newSchema = removeObjectProperty(normalizedSchema, propertyName);
        onChange(newSchema);
    };
    const handlePropertyNameChange = (oldName, newName)=>{
        if (oldName === newName) return;
        const property = properties.find((p)=>p.name === oldName);
        if (!property) return;
        const propertySchemaObj = asObjectSchema(property.schema);
        let newSchema = updateObjectProperty(normalizedSchema, newName, propertySchemaObj);
        if (property.required) newSchema = updatePropertyRequired(newSchema, newName, true);
        newSchema = removeObjectProperty(newSchema, oldName);
        onChange(newSchema);
    };
    const handlePropertyRequiredChange = (propertyName, required)=>{
        const newSchema = updatePropertyRequired(normalizedSchema, propertyName, required);
        onChange(newSchema);
    };
    const handlePropertySchemaChange = (propertyName, propertySchema)=>{
        const newSchema = updateObjectProperty(normalizedSchema, propertyName, propertySchema);
        onChange(newSchema);
    };
    return /*#__PURE__*/ jsxs("div", {
        className: "space-y-4",
        children: [
            properties.length > 0 ? /*#__PURE__*/ jsx("div", {
                className: "space-y-2",
                children: properties.map((property)=>/*#__PURE__*/ jsx(SchemaPropertyEditor, {
                        name: property.name,
                        schema: property.schema,
                        required: property.required,
                        onDelete: ()=>handleDeleteProperty(property.name),
                        onNameChange: (newName)=>handlePropertyNameChange(property.name, newName),
                        onRequiredChange: (required)=>handlePropertyRequiredChange(property.name, required),
                        onSchemaChange: (schema)=>handlePropertySchemaChange(property.name, schema),
                        depth: depth
                    }, property.name))
            }) : /*#__PURE__*/ jsx("div", {
                className: "text-sm text-muted-foreground italic p-2 text-center border rounded-md",
                children: t.objectPropertiesNone
            }),
            /*#__PURE__*/ jsx("div", {
                className: "mt-4",
                children: /*#__PURE__*/ jsx(AddFieldButton, {
                    onAddField: handleAddProperty,
                    variant: "secondary"
                })
            })
        ]
    });
};
const ObjectEditor = ObjectEditor_ObjectEditor;
export { ObjectEditor as default };
