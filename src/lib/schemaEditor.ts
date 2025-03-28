import type { JSONSchema, NewField } from "@/types/jsonSchema";

export type Property = {
  name: string;
  schema: JSONSchema;
  required: boolean;
};

export function copySchema<T extends JSONSchema>(schema: T): T {
  if (typeof structuredClone === "function") return structuredClone(schema);
  return JSON.parse(JSON.stringify(schema));
}

export function isObject(schema: JSONSchema): schema is JSONSchema & {
  type: "object";
  properties: Record<string, JSONSchema>;
  required?: string[];
} {
  return (
    typeof schema === "object" &&
    schema.type === "object" &&
    "properties" in schema
  );
}

export function getChildren(schema: JSONSchema): Property[] {
  if (typeof schema === "boolean") return [];
  if (schema.type === "object") {
    return Object.entries(schema.properties || {}).map(([name, prop]) => ({
      name,
      schema: prop,
      required: schema.required?.includes(name) || false,
    }));
  }
  if (schema.type === "array") {
    return [
      {
        name: "items",
        schema: schema.items,
        required: schema.required?.includes("items") || false,
      },
    ];
  }
  return [];
}

export function hasChildren(schema: JSONSchema): boolean {
  if (typeof schema === "boolean") return false;
  if (schema.type === "object") return !!schema.properties;
  if (
    schema.type === "array" &&
    schema.items &&
    typeof schema.items === "object"
  ) {
    return schema.items.type === "object" && !!schema.items.properties;
  }
  return false;
}

export function getParentSchema(
  schema: JSONSchema,
  path: string[],
): JSONSchema | null {
  if (path.length === 0) return schema;
  const parentPath = path.slice(0, -1);
  return parentPath.reduce((acc: JSONSchema | null, curr) => {
    if (!acc || typeof acc === "boolean" || !acc.properties?.[curr])
      return null;
    return acc.properties[curr];
  }, schema);
}

export function updateRequiredFields(
  schema: JSONSchema,
  path: string[],
  required: boolean,
): JSONSchema {
  if (path.length === 0) return schema;
  const parentPath = path.slice(0, -1);
  const fieldName = path[path.length - 1];

  const newSchema = copySchema(schema);
  let currentSchema = newSchema;

  // Navigate to the parent schema
  for (const segment of parentPath) {
    if (
      typeof currentSchema !== "object" ||
      !currentSchema.properties?.[segment]
    ) {
      return newSchema;
    }
    currentSchema = currentSchema.properties[segment];
  }

  if (!isObject(currentSchema)) return newSchema;

  currentSchema.required = required
    ? [...(currentSchema.required || []), fieldName]
    : (currentSchema.required || []).filter((field) => field !== fieldName);

  return newSchema;
}

export function setSchemaProperty(
  schema: JSONSchema,
  path: string[],
  value: JSONSchema,
): JSONSchema {
  if (path.length === 0 || typeof schema !== "object") return value;
  const [head, ...rest] = path;

  const newSchema = copySchema(schema);
  if (!newSchema.properties) {
    newSchema.properties = {};
  }

  if (rest.length === 0) {
    newSchema.properties[head] = value;
  } else {
    const childSchema = newSchema.properties[head] || {
      type: "object",
      properties: {},
    };
    newSchema.properties[head] = setSchemaProperty(childSchema, rest, value);
  }

  return newSchema;
}

export function deleteSchemaProperty(
  schema: JSONSchema,
  path: string[],
): JSONSchema {
  if (typeof schema === "boolean" || path.length === 0) return schema;

  const [head, ...rest] = path;
  const newSchema = copySchema(schema);
  if (!newSchema.properties) return newSchema;

  if (rest.length === 0) {
    const { [head]: _, ...remaining } = newSchema.properties;
    newSchema.properties = remaining;
    if (newSchema.required) {
      newSchema.required = newSchema.required.filter((field) => field !== head);
    }
    return newSchema;
  }

  if (newSchema.properties[head]) {
    newSchema.properties = {
      ...newSchema.properties,
      [head]: deleteSchemaProperty(newSchema.properties[head], rest),
    };
  }

  return newSchema;
}

export function createFieldSchema(field: NewField): JSONSchema {
  return {
    type: field.type,
    description: field.description,
    ...field.validation,
  };
}

export function getFieldInfo(schema: JSONSchema, path: string[] = []) {
  if (typeof schema === "boolean") return null;

  const type = schema.type || "object";
  if (Array.isArray(type)) return null;

  const properties = schema.properties || {};
  const required = schema.required || [];

  return {
    type,
    properties: Object.entries(properties).map(([name, prop]) => ({
      name,
      path: [...path, name],
      schema: prop,
      required: required.includes(name),
    })),
  };
}
