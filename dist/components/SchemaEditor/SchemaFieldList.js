import { jsx } from "react/jsx-runtime";
import { getSchemaProperties } from "../../lib/schemaEditor.js";
import SchemaPropertyEditor from "./SchemaPropertyEditor.js";
const SchemaFieldList = ({ schema, onEditField, onDeleteField })=>{
    const properties = getSchemaProperties(schema);
    const getValidSchemaType = (propSchema)=>{
        if ("boolean" == typeof propSchema) return "object";
        const type = propSchema.type;
        if (Array.isArray(type)) return type[0] || "object";
        return type || "object";
    };
    const handleNameChange = (oldName, newName)=>{
        const property = properties.find((prop)=>prop.name === oldName);
        if (!property) return;
        onEditField(oldName, {
            name: newName,
            type: getValidSchemaType(property.schema),
            description: "boolean" == typeof property.schema ? "" : property.schema.description || "",
            required: property.required,
            validation: "boolean" == typeof property.schema ? {
                type: "object"
            } : property.schema
        });
    };
    const handleRequiredChange = (name, required)=>{
        const property = properties.find((prop)=>prop.name === name);
        if (!property) return;
        onEditField(name, {
            name,
            type: getValidSchemaType(property.schema),
            description: "boolean" == typeof property.schema ? "" : property.schema.description || "",
            required,
            validation: "boolean" == typeof property.schema ? {
                type: "object"
            } : property.schema
        });
    };
    const handleSchemaChange = (name, updatedSchema)=>{
        const property = properties.find((prop)=>prop.name === name);
        if (!property) return;
        const type = updatedSchema.type || "object";
        const validType = Array.isArray(type) ? type[0] || "object" : type;
        onEditField(name, {
            name,
            type: validType,
            description: updatedSchema.description || "",
            required: property.required,
            validation: updatedSchema
        });
    };
    return /*#__PURE__*/ jsx("div", {
        className: "space-y-2 animate-in",
        children: properties.map((property)=>/*#__PURE__*/ jsx(SchemaPropertyEditor, {
                name: property.name,
                schema: property.schema,
                required: property.required,
                onDelete: ()=>onDeleteField(property.name),
                onNameChange: (newName)=>handleNameChange(property.name, newName),
                onRequiredChange: (required)=>handleRequiredChange(property.name, required),
                onSchemaChange: (schema)=>handleSchemaChange(property.name, schema)
            }, property.name))
    });
};
const SchemaEditor_SchemaFieldList = SchemaFieldList;
export { SchemaEditor_SchemaFieldList as default };
