import type {
  ArraySchema,
  BooleanSchema,
  JSONSchemaType,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from "@/components/SchemaEditor/SchemaExample";
import type { Field, SchemaConverterState } from "@/types/schema";
import { useEffect, useState } from "react";

export const useSchemaConverter = (
  initialSchema: JSONSchemaType = { type: "object", properties: {} },
): SchemaConverterState => {
  const [fields, setFields] = useState<Record<string, Field>>({});
  const [rootFields, setRootFields] = useState<string[]>([]);
  const [schema, setSchema] = useState<JSONSchemaType>(initialSchema);

  useEffect(() => {
    const convertSchemaToFields = (
      schema: JSONSchemaType,
    ): { fields: Record<string, Field>; rootFields: string[] } => {
      if (schema.type !== "object" || !schema.properties) {
        return { fields: {}, rootFields: [] };
      }

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
          const type = config.type;

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

          if (
            config.type === "object" &&
            "properties" in config &&
            config.properties
          ) {
            processObject(config.properties, id);
          } else if (
            config.type === "array" &&
            "items" in config &&
            config.items &&
            typeof config.items === "object" &&
            config.items.type === "object" &&
            "properties" in config.items &&
            config.items.properties
          ) {
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
    const result: ObjectSchema = {
      type: "object",
      properties: {},
      required: [],
    };

    const processField = (field: Field) => {
      if (!field.parent && result.properties) {
        let fieldSchema: JSONSchemaType;

        switch (field.type) {
          case "string":
            fieldSchema = {
              type: "string",
              description: field.description || undefined,
            } as StringSchema;
            break;
          case "number":
            fieldSchema = {
              type: "number",
              description: field.description || undefined,
            } as NumberSchema;
            break;
          case "boolean":
            fieldSchema = {
              type: "boolean",
              description: field.description || undefined,
            } as BooleanSchema;
            break;
          case "array":
            fieldSchema = {
              type: "array",
              description: field.description || undefined,
              items: { type: "object", properties: {} },
            } as ArraySchema;
            break;
          case "object":
            fieldSchema = {
              type: "object",
              description: field.description || undefined,
              properties: {},
            } as ObjectSchema;
            break;
        }

        result.properties[field.name] = fieldSchema;

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
