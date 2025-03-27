import type { JSONSchemaType } from "@/components/SchemaEditor/SchemaExample";
import type { Field, SchemaConverterState } from "@/types/schema";
import { useEffect, useState } from "react";

export const useSchemaConverter = (
  initialSchema: JSONSchemaType = { type: "object" },
): SchemaConverterState => {
  const [fields, setFields] = useState<Record<string, Field>>({});
  const [rootFields, setRootFields] = useState<string[]>([]);
  const [schema, setSchema] = useState<JSONSchemaType>(initialSchema);

  useEffect(() => {
    const convertSchemaToFields = (
      schema: JSONSchemaType,
    ): { fields: Record<string, Field>; rootFields: string[] } => {
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
          const type = config.type as Field["type"];

          result[id] = {
            id,
            name,
            type,
            description: config.description || "",
            required: isRequired,
            parent: parentId,
            children: [],
          };

          if (!parentId) {
            rootFieldIds.push(id);
          }

          if (config.type === "object" && config.properties) {
            processObject(config.properties, id);
          } else if (
            config.type === "array" &&
            config.items &&
            typeof config.items === "object"
          ) {
            const itemsProperties = (
              config.items as { properties?: Record<string, JSONSchemaType> }
            ).properties;
            if (itemsProperties) processObject(itemsProperties, id);
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
          description: field.description || undefined,
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
