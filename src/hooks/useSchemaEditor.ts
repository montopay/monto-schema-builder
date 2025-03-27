import type { JSONSchema, NewField } from "@/types/jsonSchema";
import { baseSchema } from "@/types/jsonSchema";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

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

export type Property = {
  name: string;
  schema: JSONSchema;
  required: boolean;
};

export function getChildren(schema: JSONSchema): Property[] {
  if (typeof schema === "boolean") return [];
  if (schema.type === "object")
    return Object.entries(schema.properties || {}).map(([name, prop]) => ({
      name,
      schema: prop,
      required: schema.required?.includes(name) || false,
    }));
  if (schema.type === "array")
    return [
      {
        name: "items",
        schema: schema.items,
        required: schema.required?.includes("items") || false,
      },
    ];
  return [];
}

function copySchema<T extends JSONSchema>(schema: T): T {
  if (typeof structuredClone === "function") return structuredClone(schema);
  return JSON.parse(JSON.stringify(schema));
}

function setSchemaProperty(
  schema: JSONSchema,
  path: string[],
  value: JSONSchema,
): JSONSchema {
  if (typeof schema === "boolean" || path.length === 0) return value;

  const [head, ...rest] = path;
  const newSchema = copySchema(schema);

  if (rest.length === 0) {
    if (!newSchema.properties) newSchema.properties = {};
    newSchema.properties = { ...newSchema.properties, [head]: value };
    return newSchema;
  }

  if (!newSchema.properties) newSchema.properties = {};
  if (
    !newSchema.properties[head] ||
    typeof newSchema.properties[head] === "boolean"
  ) {
    newSchema.properties[head] = { type: "object", properties: {} };
  }

  newSchema.properties = {
    ...newSchema.properties,
    [head]: setSchemaProperty(newSchema.properties[head], rest, value),
  };

  return newSchema;
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

export function useSchemaEditor(initialSchema?: JSONSchema) {
  const [schema, setSchema] = useState<JSONSchema>(
    () => initialSchema || { type: "object", properties: {} },
  );

  const fieldInfo = useMemo(() => getFieldInfo(schema), [schema]);

  const handleAddField = useCallback(
    (newField: NewField, parentPath: string[] = []) => {
      try {
        const fieldSchema: JSONSchema = {
          type: newField.type,
          description: newField.description,
          ...newField.validation,
        };

        setSchema((prevSchema) => {
          if (typeof prevSchema === "boolean") return prevSchema;

          const newSchema = setSchemaProperty(
            prevSchema,
            [...parentPath, newField.name],
            fieldSchema,
          ) as JSONSchema;

          if (newField.required) {
            const parentSchema =
              parentPath.length === 0
                ? newSchema
                : parentPath.reduce(
                    (acc, curr) =>
                      typeof acc === "boolean" || !acc.properties
                        ? acc
                        : acc.properties[curr],
                    newSchema as JSONSchema,
                  );

            if (typeof parentSchema !== "boolean") {
              parentSchema.required = [
                ...(parentSchema.required || []),
                newField.name,
              ];
            }
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

          let newSchema = deleteSchemaProperty(prevSchema, path) as JSONSchema;
          newSchema = setSchemaProperty(newSchema, newPath, {
            type: updatedField.type,
            description: updatedField.description,
            ...updatedField.validation,
          }) as JSONSchema;

          const parentSchema =
            parentPath.length === 0
              ? newSchema
              : parentPath.reduce(
                  (acc, curr) =>
                    typeof acc === "boolean" || !acc.properties
                      ? acc
                      : acc.properties[curr],
                  newSchema as JSONSchema,
                );

          if (typeof parentSchema !== "boolean") {
            parentSchema.required = [
              ...(parentSchema.required || []).filter(
                (field) => field !== oldName,
              ),
              ...(updatedField.required ? [updatedField.name] : []),
            ];
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
