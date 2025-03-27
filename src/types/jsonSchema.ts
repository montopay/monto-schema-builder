import { z } from "zod";

// Core definitions
const simpleTypes = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
  "null",
] as const;
export type SchemaType = (typeof simpleTypes)[number];

// Forward reference for recursive types
export const jsonSchemaType: z.ZodType = z.lazy(() =>
  z.union([jsonSchema, z.boolean()]),
);

// Base schema properties that all schemas can have
const baseSchemaProps = z.object({
  $id: z.string().optional(),
  $schema: z.string().optional(),
  $ref: z.string().optional(),
  $anchor: z.string().optional(),
  $dynamicRef: z.string().optional(),
  $dynamicAnchor: z.string().optional(),
  $vocabulary: z.record(z.boolean()).optional(),
  $comment: z.string().optional(),
  $defs: z.record(jsonSchemaType).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  default: z.any().optional(),
  deprecated: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  writeOnly: z.boolean().optional(),
  examples: z.array(z.any()).optional(),
});

// String schema specific validations
const stringValidations = z.object({
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(0).optional(),
  pattern: z.string().optional(),
  format: z.string().optional(),
  contentMediaType: z.string().optional(),
  contentEncoding: z.string().optional(),
  contentSchema: jsonSchemaType.optional(),
});

// Number schema specific validations
const numberValidations = z.object({
  multipleOf: z.number().positive().optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  exclusiveMinimum: z.number().optional(),
  exclusiveMaximum: z.number().optional(),
});

// Array schema specific validations
const arrayValidations = z.object({
  items: jsonSchemaType.optional(),
  prefixItems: z.array(jsonSchemaType).optional(),
  minItems: z.number().int().min(0).optional(),
  maxItems: z.number().int().min(0).optional(),
  uniqueItems: z.boolean().optional(),
  contains: jsonSchemaType.optional(),
  minContains: z.number().int().min(0).optional(),
  maxContains: z.number().int().min(0).optional(),
  unevaluatedItems: jsonSchemaType.optional(),
});

// Object schema specific validations
const objectValidations = z.object({
  properties: z.record(jsonSchemaType).optional(),
  patternProperties: z.record(jsonSchemaType).optional(),
  additionalProperties: z.union([jsonSchemaType, z.boolean()]).optional(),
  required: z.array(z.string()).optional(),
  propertyNames: jsonSchemaType.optional(),
  minProperties: z.number().int().min(0).optional(),
  maxProperties: z.number().int().min(0).optional(),
  dependentRequired: z.record(z.array(z.string())).optional(),
  dependentSchemas: z.record(jsonSchemaType).optional(),
  unevaluatedProperties: jsonSchemaType.optional(),
});

// Combining schemas
const combiners = z.object({
  allOf: z.array(jsonSchemaType).optional(),
  anyOf: z.array(jsonSchemaType).optional(),
  oneOf: z.array(jsonSchemaType).optional(),
  not: jsonSchemaType.optional(),
  if: jsonSchemaType.optional(),
  // biome-ignore lint/suspicious/noThenProperty: The property is named "then" in the JSON Schema spec
  then: jsonSchemaType.optional(),
  else: jsonSchemaType.optional(),
});

// Value validations
const valueValidations = z.object({
  const: z.any().optional(),
  enum: z.array(z.any()).optional(),
});

// The main JSON Schema definition
export const jsonSchema = baseSchemaProps
  .extend({
    type: z
      .union([z.enum(simpleTypes), z.array(z.enum(simpleTypes))])
      .optional(),
  })
  .and(stringValidations)
  .and(numberValidations)
  .and(arrayValidations)
  .and(objectValidations)
  .and(combiners)
  .and(valueValidations);

// Export types
export type JSONSchema = z.infer<typeof jsonSchema>;
export type JSONSchemaType = z.infer<typeof jsonSchemaType>;

// Field type for the visual editor
export interface Field {
  id: string;
  name: string;
  type: SchemaType;
  description: string;
  required: boolean;
  parent: string | null;
  children: string[];
  // Additional properties from JSON Schema that we support in UI
  validation: {
    // String validations
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
    // Number validations
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
    // Array validations
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    // Object validations
    minProperties?: number;
    maxProperties?: number;
    additionalProperties?: boolean;
  };
}

export interface NewField {
  name: string;
  type: SchemaType;
  description: string;
  required: boolean;
  validation?: Field["validation"];
}

export interface SchemaEditorState {
  fields: Record<string, Field>;
  rootFields: string[];
  schema: JSONSchemaType;
  handleAddField: (newField: NewField, parentId?: string) => void;
  handleEditField: (id: string, updatedField: NewField) => void;
  handleDeleteField: (id: string) => void;
  handleSchemaEdit: (schema: JSONSchemaType) => void;
}
