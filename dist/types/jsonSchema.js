import { z } from "zod";
const simpleTypes = [
    "string",
    "number",
    "integer",
    "boolean",
    "object",
    "array",
    "null"
];
const baseSchema = z.object({
    $id: z.string().optional(),
    $schema: z.string().optional(),
    $ref: z.string().optional(),
    $anchor: z.string().optional(),
    $dynamicRef: z.string().optional(),
    $dynamicAnchor: z.string().optional(),
    $vocabulary: z.record(z.string(), z.boolean()).optional(),
    $comment: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    default: z.unknown().optional(),
    deprecated: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    writeOnly: z.boolean().optional(),
    examples: z.array(z.unknown()).optional(),
    type: z.union([
        z["enum"](simpleTypes),
        z.array(z["enum"](simpleTypes))
    ]).optional(),
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(0).optional(),
    pattern: z.string().optional(),
    format: z.string().optional(),
    contentMediaType: z.string().optional(),
    contentEncoding: z.string().optional(),
    multipleOf: z.number().positive().optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    exclusiveMinimum: z.number().optional(),
    exclusiveMaximum: z.number().optional(),
    minItems: z.number().int().min(0).optional(),
    maxItems: z.number().int().min(0).optional(),
    uniqueItems: z.boolean().optional(),
    minContains: z.number().int().min(0).optional(),
    maxContains: z.number().int().min(0).optional(),
    required: z.array(z.string()).optional(),
    minProperties: z.number().int().min(0).optional(),
    maxProperties: z.number().int().min(0).optional(),
    dependentRequired: z.record(z.string(), z.array(z.string())).optional(),
    const: z.unknown().optional(),
    enum: z.array(z.unknown()).optional()
});
const jsonSchemaType = z.lazy(()=>z.union([
        baseSchema.extend({
            $defs: z.record(z.string(), jsonSchemaType).optional(),
            contentSchema: jsonSchemaType.optional(),
            items: jsonSchemaType.optional(),
            prefixItems: z.array(jsonSchemaType).optional(),
            contains: jsonSchemaType.optional(),
            unevaluatedItems: jsonSchemaType.optional(),
            properties: z.record(z.string(), jsonSchemaType).optional(),
            patternProperties: z.record(z.string(), jsonSchemaType).optional(),
            additionalProperties: z.union([
                jsonSchemaType,
                z.boolean()
            ]).optional(),
            propertyNames: jsonSchemaType.optional(),
            dependentSchemas: z.record(z.string(), jsonSchemaType).optional(),
            unevaluatedProperties: jsonSchemaType.optional(),
            allOf: z.array(jsonSchemaType).optional(),
            anyOf: z.array(jsonSchemaType).optional(),
            oneOf: z.array(jsonSchemaType).optional(),
            not: jsonSchemaType.optional(),
            if: jsonSchemaType.optional(),
            then: jsonSchemaType.optional(),
            else: jsonSchemaType.optional()
        }),
        z.boolean()
    ]));
function isBooleanSchema(schema) {
    return "boolean" == typeof schema;
}
function isObjectSchema(schema) {
    return !isBooleanSchema(schema);
}
function asObjectSchema(schema) {
    return isObjectSchema(schema) ? schema : {
        type: "null"
    };
}
function getSchemaDescription(schema) {
    return isObjectSchema(schema) ? schema.description || "" : "";
}
function withObjectSchema(schema, fn, defaultValue) {
    return isObjectSchema(schema) ? fn(schema) : defaultValue;
}
export { asObjectSchema, baseSchema, getSchemaDescription, isBooleanSchema, isObjectSchema, jsonSchemaType, withObjectSchema };
