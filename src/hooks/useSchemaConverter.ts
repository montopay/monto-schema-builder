import { useEffect, useState } from "react";
import type { JSONSchemaType } from "@/components/SchemaEditor/SchemaExample";

export type Field = {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
  parent?: string | null;
  children?: string[];
};

export type SchemaToFieldsResult = {
  fields: Record<string, Field>;
  rootFields: string[];
};

/**
 * Hook to convert between JSON Schema and internal field representation
 */
export const useSchemaConverter = (
  initialSchema: JSONSchemaType = { type: "object" },
) => {
  const [fields, setFields] = useState<Record<string, Field>>({});
  const [rootFields, setRootFields] = useState<string[]>([]);
  const [schema, setSchema] = useState<JSONSchemaType>(initialSchema);

  useEffect(() => {
    const convertSchemaToFields = (
      schema: JSONSchemaType,
    ): SchemaToFieldsResult => {
      if (!schema || !schema.properties) return { fields: {}, rootFields: [] };

      const result: Record<string, Field> = {};
      const rootFieldIds: string[] = [];
      const required = schema.required || [];

      const processObject = (
        props: Record<string, JSONSchemaType>,
        parentId: string | null = null,
      ) => {
        for (const [name, config] of Object.entries(props)) {
          const id = parentId ? `${parentId}_${name}` : name;
          const isRequired = required.includes(name);

          result[id] = {
            id,
            name,
            type: config.type,
            description: config.description || "",
            required: isRequired,
            parent: parentId,
          };

          if (!parentId) {
            rootFieldIds.push(id);
          }

          if (config.type === "object" && config.properties) {
            processObject(config.properties, id);
          } else if (config.type === "array" && config.items?.properties) {
            processObject(config.items.properties, id);
          }
        }
      };

      processObject(schema.properties);
      return { fields: result, rootFields: rootFieldIds };
    };

    const { fields: newFields, rootFields: newRootFields } =
      convertSchemaToFields(schema);
    setFields(newFields);
    setRootFields(newRootFields);
  }, [schema]);

  const convertFieldsToSchema = (): JSONSchemaType => {
    const result: JSONSchemaType = {
      type: "object",
      properties: {},
      required: [],
    };

    const processField = (field: Field) => {
      if (!field.parent && result.properties) {
        result.properties[field.name] = {
          type: field.type,
          description: field.description,
        };

        if (field.required) {
          result.required?.push(field.name);
        }
      }
    };

    for (const field of Object.values(fields)) {
      processField(field);
    }

    return result;
  };

  return {
    schema,
    setSchema,
    fields,
    rootFields,
    convertFieldsToSchema,
  };
};
