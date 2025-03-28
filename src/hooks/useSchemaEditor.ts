import type { JSONSchema, NewField } from "@/types/jsonSchema";
import { baseSchema } from "@/types/jsonSchema";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type Property = {
  name: string;
  schema: JSONSchema;
  required: boolean;
};

function copySchema<T extends JSONSchema>(schema: T): T {
  if (typeof structuredClone === "function") return structuredClone(schema);
  return JSON.parse(JSON.stringify(schema));
}

function isObject(schema: JSONSchema): schema is JSONSchema & {
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

function getParentSchema(
  schema: JSONSchema,
  path: string[],
): JSONSchema | null {
  if (path.length === 0) return schema;
  return path.slice(0, -1).reduce((acc, curr) => {
    if (typeof acc === "boolean" || !acc.properties) return null;
    return acc.properties[curr];
  }, schema);
}

function updateRequiredFields(
  schema: JSONSchema,
  path: string[],
  required: boolean,
): JSONSchema {
  if (path.length === 0) return schema;
  const parentPath = path.slice(0, -1);
  const fieldName = path[path.length - 1];
  
  const parentSchema = getParentSchema(schema, path);
  if (!isObject(parentSchema)) return schema;

  const newSchema = copySchema(schema);
  const currentParent = getParentSchema(newSchema, parentPath);
  if (!isObject(currentParent)) return newSchema;

  currentParent.required = required
    ? [...(currentParent.required || []), fieldName]
    : (currentParent.required || []).filter((field) => field !== fieldName);

  return newSchema;
}

function setSchemaProperty(
  schema: JSONSchema,
  path: string[],
  value: JSONSchema,
): JSONSchema {
  if (path.length === 0 || typeof schema !== "object") return value;
  const children = getChildren(schema);
  const child = children.find((child) => child.name === path[0]);
  if (!child) return schema;

  return {
    ...schema,
    properties: {
      ...schema.properties,
      [child.name]: setSchemaProperty(child.schema, path.slice(1), value),
    },
  };
}

function deleteSchemaProperty(schema: JSONSchema, path: string[]): JSONSchema {
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

function createFieldSchema(field: NewField): JSONSchema {
  return {
    type: field.type,
    description: field.description,
    ...field.validation,
  };
}

function getFieldInfo(schema: JSONSchema, path: string[] = []) {
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

export function useSchemaEditor(initialSchema?: JSONSchema) {
  const [schema, setSchema] = useState<JSONSchema>(
    () => initialSchema || { type: "object", properties: {} },
  );
  const fieldInfo = useMemo(() => getFieldInfo(schema), [schema]);

  const handleAddField = useCallback(
    (newField: NewField, parentPath: string[] = []) => {
      try {
        setSchema((prevSchema) => {
          if (typeof prevSchema === "boolean") return prevSchema;
          const newPath = [...parentPath, newField.name];
          let newSchema = setSchemaProperty(
            prevSchema,
            newPath,
            createFieldSchema(newField),
          );
          if (newField.required) {
            newSchema = updateRequiredFields(newSchema, newPath, true);
          }
          return newSchema;
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add field",
        );
      }
    },
    [],
  );

  const handleEditField = useCallback(
    (path: string[], updatedField: NewField) => {
      try {
        setSchema((prevSchema) => {
          if (typeof prevSchema === "boolean") return prevSchema;
          const parentPath = path.slice(0, -1);
          const oldName = path[path.length - 1];
          const newPath = [...parentPath, updatedField.name];

          let newSchema = setSchemaProperty(
            prevSchema,
            newPath,
            createFieldSchema(updatedField),
          );

          newSchema = updateRequiredFields(newSchema, path, false);
          if (updatedField.required) {
            newSchema = updateRequiredFields(newSchema, newPath, true);
          }
          return newSchema;
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to edit field",
        );
      }
    },
    [],
  );

  const handleDeleteField = useCallback((path: string[]) => {
    setSchema((prevSchema) => deleteSchemaProperty(prevSchema, path));
  }, []);

  const handleSchemaEdit = useCallback((newSchema: JSONSchema) => {
    try {
      baseSchema.parse(newSchema);
      setSchema(newSchema);
    } catch (error) {
      toast.error("Invalid JSON Schema");
    }
  }, []);

  return {
    schema,
    fieldInfo,
    handleAddField,
    handleEditField,
    handleDeleteField,
    handleSchemaEdit,
  };
}
