import { isBooleanSchema, isObjectSchema } from "../types/jsonSchema.js";
function copySchema(schema) {
    if ("function" == typeof structuredClone) return structuredClone(schema);
    return JSON.parse(JSON.stringify(schema));
}
function updateObjectProperty(schema, propertyName, propertySchema) {
    if (!isObjectSchema(schema)) return schema;
    const newSchema = copySchema(schema);
    if (!newSchema.properties) newSchema.properties = {};
    newSchema.properties[propertyName] = propertySchema;
    return newSchema;
}
function removeObjectProperty(schema, propertyName) {
    if (!isObjectSchema(schema) || !schema.properties) return schema;
    const newSchema = copySchema(schema);
    const { [propertyName]: _, ...remainingProps } = newSchema.properties;
    newSchema.properties = remainingProps;
    if (newSchema.required) newSchema.required = newSchema.required.filter((name)=>name !== propertyName);
    return newSchema;
}
function updatePropertyRequired(schema, propertyName, required) {
    if (!isObjectSchema(schema)) return schema;
    const newSchema = copySchema(schema);
    if (!newSchema.required) newSchema.required = [];
    if (required) {
        if (!newSchema.required.includes(propertyName)) newSchema.required.push(propertyName);
    } else newSchema.required = newSchema.required.filter((name)=>name !== propertyName);
    return newSchema;
}
function updateArrayItems(schema, itemsSchema) {
    if (isObjectSchema(schema) && "array" === schema.type) return {
        ...schema,
        items: itemsSchema
    };
    return schema;
}
function createFieldSchema(field) {
    const { type, description, validation } = field;
    if (isObjectSchema(validation)) return {
        type,
        description,
        ...validation
    };
    return validation;
}
function validateFieldName(name) {
    if (!name || "" === name.trim()) return false;
    const validNamePattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    return validNamePattern.test(name);
}
function getSchemaProperties(schema) {
    if (!isObjectSchema(schema) || !schema.properties) return [];
    const required = schema.required || [];
    return Object.entries(schema.properties).map(([name, propSchema])=>({
            name,
            schema: propSchema,
            required: required.includes(name)
        }));
}
function getArrayItemsSchema(schema) {
    if (isBooleanSchema(schema)) return null;
    if ("array" !== schema.type) return null;
    return schema.items || null;
}
function hasChildren(schema) {
    if (!isObjectSchema(schema)) return false;
    if ("object" === schema.type && schema.properties) return Object.keys(schema.properties).length > 0;
    if ("array" === schema.type && schema.items && isObjectSchema(schema.items)) return "object" === schema.items.type && !!schema.items.properties;
    return false;
}
export { copySchema, createFieldSchema, getArrayItemsSchema, getSchemaProperties, hasChildren, removeObjectProperty, updateArrayItems, updateObjectProperty, updatePropertyRequired, validateFieldName };
